import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@/lib/utils/auth";
import React from "react";
import { authExchange } from "@urql/exchange-auth";
import {
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
} from "@/lib/services/graphql/generated";
import { REFRESH_TOKEN_MUTATION } from "@/lib/services/graphql/requests/mutations/auth";
import { useUserStore } from "@/lib/stores/users";
import {
  cacheExchange,
  Client,
  fetchExchange,
  Provider,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";

type Props = {
  children?: React.ReactNode;
};

const WS_TAG = "[WS]";

const createWSClientInstance = () =>
  createWSClient({
    url: process.env.EXPO_PUBLIC_GRAPHQL_SUBSCRIPTION_URL ?? "",
    retryAttempts: 20,
    async retryWait(retries) {
      // Exponential backoff: 1s, 2s, 4s … capped at 30s
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** retries, 30_000)),
      );
    },
    async connectionParams() {
      const tokens = await getAuthTokens();
      console.log(
        WS_TAG,
        "connectionParams — has token:",
        Boolean(tokens?.access),
      );
      return {
        authorization: tokens?.access ? `Bearer ${tokens.access}` : null,
      };
    },
    on: {
      connecting: () => console.log(WS_TAG, "connecting…"),
      connected: () => console.log(WS_TAG, "connected"),
      closed: (event) => console.log(WS_TAG, "closed", JSON.stringify(event)),
      error: (err) =>
        console.log(
          WS_TAG,
          "error",
          err instanceof Error ? err.message : JSON.stringify(err),
        ),
      message: (msg) =>
        msg.type !== "next" && console.log(WS_TAG, "msg type:", msg.type),
    },
  });

const createClient = (ws: ReturnType<typeof createWSClientInstance>) => {
  return new Client({
    url: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "",
    preferGetMethod: false,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        const tokens = await getAuthTokens();

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
            return error.graphQLErrors.some(
              (e) =>
                e.message.includes("Invalid token") ||
                e.message.includes("Authentication"),
            );
          },
          async refreshAuth() {
            if (!tokens?.refresh) {
              clearAuthTokens();
            } else {
              const result = await utils.mutate<
                RefreshTokenMutation,
                RefreshTokenMutationVariables
              >(REFRESH_TOKEN_MUTATION, {
                input: {
                  refreshToken: tokens?.refresh,
                },
              });
              if (result.data?.refreshToken.data) {
                saveAuthTokens({
                  access: result.data.refreshToken.data.token,
                  refresh: result.data.refreshToken.data.refreshToken,
                });
              } else {
                clearAuthTokens();
              }
            }
          },
        };
      }),
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(request) {
          const input = { ...request, query: request.query || "" };
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
  const wsRef = React.useRef<ReturnType<typeof createWSClientInstance> | null>(
    null,
  );
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
      subscribe: () => ({ unsubscribe: () => { } }),
      dispose: () => { },
    } as any),
  );

  return <Provider value={client ?? fallbackClient}>{children}</Provider>;
};

export default URQLProvider;
