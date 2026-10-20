import { clearAuthTokens, getAuthTokens, saveAuthTokens } from '@/lib/utils/auth';
import React from 'react';
import { authExchange } from '@urql/exchange-auth';
import {
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
} from '@/lib/services/graphql/generated';
import { REFRESH_TOKEN_MUTATION } from '@/lib/services/graphql/requests/mutations/auth';
import { useUserStore } from '@/lib/stores/users';
import { Client, fetchExchange, mapExchange, Provider, subscriptionExchange } from 'urql';
import { graphcacheExchange } from '@/lib/services/graphql/cache';
import { createClient as createWSClient } from 'graphql-ws';
import { router } from 'expo-router';
import { findUpgradeRequired } from '@/lib/k/app-version';
import { APP_VERSION_HEADERS, reportUpgradeRequired } from '@/lib/k/app-version-store';
import { READ_MUTATIONS, requestBadgeSync } from '@/lib/k/app-badge';

type Props = {
  children?: React.ReactNode;
};

const WS_TAG = '[WS]';

const createWSClientInstance = () =>
  createWSClient({
    url: process.env.EXPO_PUBLIC_GRAPHQL_SUBSCRIPTION_URL ?? '',
    retryAttempts: 20,
    async retryWait(retries) {
      // Exponential backoff: 1s, 2s, 4s … capped at 30s
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** retries, 30_000)));
    },
    async connectionParams() {
      const tokens = await getAuthTokens();
      console.info(WS_TAG, 'connectionParams — has token:', Boolean(tokens?.access));
      return {
        authorization: tokens?.access ? `Bearer ${tokens.access}` : null,
        // WebSockets can't carry custom headers everywhere, so the app
        // version rides in the connection_init payload too.
        ...APP_VERSION_HEADERS,
      };
    },
    on: {
      connecting: () => console.info(WS_TAG, 'connecting…'),
      connected: () => console.info(WS_TAG, 'connected'),
      closed: (event) => console.info(WS_TAG, 'closed', JSON.stringify(event)),
      error: (err) =>
        console.info(WS_TAG, 'error', err instanceof Error ? err.message : JSON.stringify(err)),
      message: (msg) => msg.type !== 'next' && console.info(WS_TAG, 'msg type:', msg.type),
    },
  });

const createClient = (ws: ReturnType<typeof createWSClientInstance>) => {
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
            // Read fresh from storage — the closure value may already be stale.
            const storedTokens = await getAuthTokens();
            if (!storedTokens?.refresh) {
              tokens = null;
              clearAuthTokens();
              useUserStore.getState().reset();
              return;
            }
            const result = await utils.mutate<RefreshTokenMutation, RefreshTokenMutationVariables>(
              REFRESH_TOKEN_MUTATION,
              {
                input: { refreshToken: storedTokens.refresh },
              },
            );
            if (result.data?.refreshToken.data) {
              const data = result.data.refreshToken.data;
              tokens = { access: data.token, refresh: data.refreshToken };
              await saveAuthTokens(tokens);
            } else {
              // A refresh token existed but the refresh failed → the session is
              // genuinely expired. Clear it AND kick the user to /auth so they
              // don't sit on a stale, half-loaded screen. (The no-refresh-token
              // case above is an anonymous/Explore browser — route guards handle
              // those, so we don't yank them out of the public browse area.)
              tokens = null;
              clearAuthTokens();
              useUserStore.getState().reset();
              router.replace('/auth');
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
              const unsubscribe = ws.subscribe(input, sink);
              return { unsubscribe };
            },
          };
        },
      }),
    ],
  });
};

const URQLProvider: React.FC<Props> = ({ children }) => {
  const user = useUserStore((c) => c.user);
  const wsRef = React.useRef<ReturnType<typeof createWSClientInstance> | null>(null);
  const [client, setClient] = React.useState<Client | null>(null);

  React.useEffect(() => {
    // Dispose the previous WS client so its pending retries stop immediately.
    wsRef.current?.dispose();

    if (!user.user?.id) {
      // Not logged in — no WS connection needed. Keep any existing URQL client
      // (needed for the login mutation) but don't open a WS socket.
      wsRef.current = null;
      return;
    }

    // Logged in: create a fresh WS client so connectionParams picks up the
    // new token on the very next handshake.
    const ws = createWSClientInstance();
    wsRef.current = ws;
    setClient(createClient(ws));

    return () => {
      ws.dispose();
      wsRef.current = null;
    };
  }, [user.user?.id, user.tokenData?.expiresAt]);

  // Render a client-less provider on first paint so children (including the
  // login screen's mutations) are never blocked waiting for a WS connection.
  const [fallbackClient] = React.useState(() =>
    createClient({
      subscribe: () => ({ unsubscribe: () => {} }),
      dispose: () => {},
    } as any),
  );

  return <Provider value={client ?? fallbackClient}>{children}</Provider>;
};

export default URQLProvider;
