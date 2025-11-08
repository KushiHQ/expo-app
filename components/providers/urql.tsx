import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@/lib/utils/auth";
import React from "react";
import { cacheExchange, Client, fetchExchange, Provider } from "urql";
import { authExchange } from "@urql/exchange-auth";
import {
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
} from "@/lib/services/graphql/generated";
import { REFRESH_TOKEN_MUTATION } from "@/lib/services/graphql/requests/mutations/auth";

type Props = {
  children?: React.ReactNode;
};

const client = new Client({
  url: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "",
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
  ],
});

const URQLProvider: React.FC<Props> = ({ children }) => {
  return <Provider value={client}>{children}</Provider>;
};

export default URQLProvider;
