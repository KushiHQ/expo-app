import { clearAuthTokens, getAuthTokens } from '@/lib/utils/auth';
import React from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from '@sentry/react-native';
import { authExchange } from '@urql/exchange-auth';
import { useUserStore } from '@/lib/stores/users';
import { Client, fetchExchange, mapExchange, Provider, subscriptionExchange } from 'urql';
import { graphcacheExchange } from '@/lib/services/graphql/cache';
import { createClient as createWSClient } from 'graphql-ws';
import { router } from 'expo-router';
import { findUpgradeRequired } from '@/lib/k/app-version';
import { isCallScreenUp } from '@/lib/call/state';
import { APP_VERSION_HEADERS, reportUpgradeRequired } from '@/lib/k/app-version-store';
import { READ_MUTATIONS, requestBadgeSync } from '@/lib/k/app-badge';
import {
  freshAccessToken,
  markLiveConnected,
  markLiveDown,
  refreshAccessToken,
  requestLiveCatchUp,
  resetLiveConnection,
} from '@/lib/k/live-connection';

type Props = {
  children?: React.ReactNode;
};

const WS_TAG = '[WS]';

/** Keep-alive: ping every 15 s; no pong within 6 s means the socket is dead. */
const PING_EVERY_MS = 15_000;
const PONG_TIMEOUT_MS = 6_000;

const backoff = (attempt: number) =>
  Math.min(500 * 2 ** attempt, 10_000) + Math.floor(Math.random() * 500);

/**
 * A WebSocket client that never gives up quietly. Phones drop sockets all the
 * time (background, power saving, network changes), so it:
 * - retries forever, on every kind of failure. graphql-ws only retries close
 *   events by default, and React Native reports a dead socket as an `error`
 *   event first — that one error ended every subscription for good, which is
 *   what showed "Live updates paused";
 * - pings, and drops a socket that stops answering instead of sitting on a
 *   silent dead connection;
 * - reconnects at once when the app comes back or the network returns, rather
 *   than waiting out the backoff;
 * - refreshes an expiring access token before authenticating the socket.
 */
const createWSClientInstance = () => {
  let socket: WebSocket | null = null;
  let pongTimer: ReturnType<typeof setTimeout> | undefined;
  let wake: (() => void) | null = null;

  const expectPong = () => {
    clearTimeout(pongTimer);
    pongTimer = setTimeout(() => {
      console.info(WS_TAG, 'no pong — reconnecting');
      if (socket?.readyState === WebSocket.OPEN) socket.close(4408, 'Pong timeout');
    }, PONG_TIMEOUT_MS);
  };

  const client = createWSClient({
    url: process.env.EXPO_PUBLIC_GRAPHQL_SUBSCRIPTION_URL ?? '',
    retryAttempts: Infinity,
    shouldRetry: () => true,
    keepAlive: PING_EVERY_MS,
    async retryWait(retries) {
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, backoff(retries));
        wake = () => {
          clearTimeout(t);
          resolve();
        };
      });
      wake = null;
    },
    async connectionParams() {
      const access = await freshAccessToken();
      console.info(WS_TAG, 'connectionParams — has token:', Boolean(access));
      return {
        authorization: access ? `Bearer ${access}` : null,
        // WebSockets can't carry custom headers everywhere, so the app
        // version rides in the connection_init payload too.
        ...APP_VERSION_HEADERS,
      };
    },
    on: {
      connecting: () => console.info(WS_TAG, 'connecting…'),
      opened: (s) => {
        socket = s as WebSocket;
      },
      connected: () => {
        console.info(WS_TAG, 'connected');
        markLiveConnected();
      },
      // graphql-ws sent its keep-alive ping: a pong must follow.
      ping: (received) => {
        if (!received) expectPong();
      },
      pong: (received) => {
        if (received) clearTimeout(pongTimer);
      },
      closed: (event) => {
        clearTimeout(pongTimer);
        socket = null;
        console.info(WS_TAG, 'closed', JSON.stringify(event));
        // 1000 is the lazy close when no screen subscribes any more: not an outage.
        if ((event as CloseEvent | undefined)?.code === 1000) resetLiveConnection();
        else markLiveDown();
      },
      error: (err) =>
        console.info(WS_TAG, 'error', err instanceof Error ? err.message : JSON.stringify(err)),
      message: (msg) => msg.type !== 'next' && console.info(WS_TAG, 'msg type:', msg.type),
    },
  });

  return {
    subscribe: client.subscribe,
    dispose: client.dispose,
    /** App back in the foreground / network back: check the socket now. */
    revive() {
      if (wake) {
        wake();
      } else if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
        expectPong();
      }
    },
    /** Reconnect with fresh connection params (e.g. after a token refresh). */
    reconnect() {
      if (wake) wake();
      else client.terminate();
    },
  };
};

type WS = ReturnType<typeof createWSClientInstance>;

const isAuthError = (err: unknown) => {
  const list = Array.isArray(err) ? err : [err];
  return list.some((e: any) => typeof e?.message === 'string' && e.message.includes('Auth Error'));
};

/**
 * Subscriptions that survive errors: a failed or ended subscription is quietly
 * re-established (after refreshing the token and reconnecting, for auth
 * errors), so a screen never gets stuck without live updates. Only an error
 * the API itself keeps returning is passed on to the screen.
 */
function resilientSubscribe(ws: WS, input: any, sink: any) {
  let stopped = false;
  let unsub: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let lastAuthFix = 0;

  const restart = (delay: number) => {
    const u = unsub;
    unsub = null;
    u?.();
    if (!stopped) timer = setTimeout(start, delay);
  };

  const start = () => {
    if (stopped) return;
    unsub = ws.subscribe(input, {
      next: (value: any) => {
        failures = 0;
        sink.next(value);
      },
      complete: () => {
        // The server ended the stream (e.g. a deploy): open it again.
        if (!stopped) restart(backoff(0));
      },
      error: async (err: unknown) => {
        if (stopped) return;
        failures += 1;
        const auth = isAuthError(err);
        Sentry.addBreadcrumb({
          category: 'ws',
          level: 'warning',
          message: 'subscription error, resubscribing',
          data: { failures, auth },
        });
        if (auth && Date.now() - lastAuthFix > 10_000) {
          lastAuthFix = Date.now();
          try {
            await refreshAccessToken();
          } catch {}
          // The socket authenticated with the old token: reconnect it.
          ws.reconnect();
          restart(500);
          return;
        }
        if (Array.isArray(err) && failures >= 6) {
          sink.error(err);
          return;
        }
        restart(backoff(Math.min(failures, 5)));
      },
    });
  };

  start();
  return {
    unsubscribe() {
      stopped = true;
      clearTimeout(timer);
      unsub?.();
    },
  };
}

const createClient = (ws: WS) => {
  return new Client({
    url: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? '',
    preferGetMethod: false,
    // x-kushi-app-platform / x-kushi-app-version on every request. authExchange's
    // appendHeaders merges into these, so Authorization is added on top.
    fetchOptions: { headers: { ...APP_VERSION_HEADERS } },
    exchanges: [
      // Outermost, so it sees every result: an UPGRADE_REQUIRED error from the
      // API raises the full-screen update gate (components/k/app-update.tsx).
      mapExchange({
        onError(error) {
          const upgrade = findUpgradeRequired(error.graphQLErrors);
          if (upgrade) reportUpgradeRequired(upgrade);
        },
        // Reading a chat or a notification lowers the unread count, so the
        // app icon badge re-syncs (lib/k/app-badge.ts).
        onResult(result) {
          const data = result.data as Record<string, unknown> | undefined;
          if (result.operation.kind === 'mutation' && data && READ_MUTATIONS.some((m) => m in data)) {
            requestBadgeSync();
          }
        },
      }),
      graphcacheExchange,
      authExchange(async (utils) => {
        // Mutable reference so addAuthToOperation always uses the latest token
        // after a mid-session refresh — a const closure would keep the stale token.
        let tokens = await getAuthTokens();

        return {
          addAuthToOperation(operation) {
            if (!tokens?.access) {
              return operation;
            }
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${tokens.access}`,
            });
          },
          didAuthError(error, _operation) {
            return error.graphQLErrors.some((e) => e.message.includes('Auth Error'));
          },
          async refreshAuth() {
            // One shared refresh for HTTP and the socket (lib/k/live-connection),
            // so two refreshes never race with the same refresh token.
            const storedTokens = await getAuthTokens();
            if (!storedTokens?.refresh) {
              tokens = null;
              clearAuthTokens();
              useUserStore.getState().reset();
              return;
            }
            let access: string | null;
            try {
              access = await refreshAccessToken();
            } catch {
              // Offline or the API is down: keep the session and try again later.
              return;
            }
            if (access) {
              tokens = await getAuthTokens();
            } else {
              // The API rejected the refresh token → the session is genuinely
              // expired. Clear it AND kick the user to /auth so they don't sit
              // on a stale, half-loaded screen. (The no-refresh-token case above
              // is an anonymous/Explore browser — route guards handle those, so
              // we don't yank them out of the public browse area.)
              tokens = null;
              clearAuthTokens();
              useUserStore.getState().reset();
              // Not while a call screen is up: the replace would close the call.
              if (!isCallScreenUp()) router.replace('/auth');
            }
          },
        };
      }),
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(request) {
          const input = { ...request, query: request.query || '' };
          return {
            subscribe(sink) {
              return resilientSubscribe(ws, input, sink);
            },
          };
        },
      }),
    ],
  });
};

const URQLProvider: React.FC<Props> = ({ children }) => {
  const user = useUserStore((c) => c.user);
  const wsRef = React.useRef<WS | null>(null);
  const [client, setClient] = React.useState<Client | null>(null);

  React.useEffect(() => {
    // Dispose the previous WS client so its pending retries stop immediately.
    wsRef.current?.dispose();

    if (!user.user?.id) {
      // Not logged in — no WS connection needed. Keep any existing URQL client
      // (needed for the login mutation) but don't open a WS socket.
      wsRef.current = null;
      resetLiveConnection();
      return;
    }

    // Logged in: create a fresh WS client so connectionParams picks up the
    // new token on the very next handshake.
    const ws = createWSClientInstance();
    wsRef.current = ws;
    setClient(createClient(ws));

    // Back in the foreground or back online: check the socket straight away,
    // and let screens catch up on anything sent while the app was away.
    let wasBackground = false;
    const appSub = AppState.addEventListener('change', (st) => {
      if (st === 'background') wasBackground = true;
      if (st === 'active') {
        ws.revive();
        if (wasBackground) requestLiveCatchUp();
        wasBackground = false;
      }
    });
    let wasOffline = false;
    const netSub = NetInfo.addEventListener((net) => {
      const online = net.isConnected !== false && net.isInternetReachable !== false;
      if (online && wasOffline) ws.revive();
      wasOffline = !online;
    });

    return () => {
      appSub.remove();
      netSub();
      ws.dispose();
      wsRef.current = null;
    };
  }, [user.user?.id, user.tokenData?.expiresAt]);

  // Render a client-less provider on first paint so children (including the
  // login screen's mutations) are never blocked waiting for a WS connection.
  const [fallbackClient] = React.useState(() =>
    createClient({
      subscribe: () => () => {},
      dispose: () => {},
      revive: () => {},
      reconnect: () => {},
    } as unknown as WS),
  );

  return <Provider value={client ?? fallbackClient}>{children}</Provider>;
};

export default URQLProvider;
