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

const wsClient = createWSClient({
	url: process.env.EXPO_PUBLIC_GRAPHQL_SUBSCRIPTION_URL ?? "",
	async connectionParams() {
		const tokens = await getAuthTokens();

		return {
			authorization: tokens?.access ? `Bearer ${tokens.access}` : null,
		};
	},
});

const createClient = () => {
	return new Client({
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
			subscriptionExchange({
				forwardSubscription(request) {
					const input = { ...request, query: request.query || "" };
					return {
						subscribe(sink) {
							const unsubscribe = wsClient.subscribe(input, sink);
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

	const [client, setClient] = React.useState<Client | null>(null);

	React.useEffect(() => {
		const client = createClient();

		setClient(client);
	}, [user.user?.id, user.tokenData?.expiresAt]);

	if (!client) return null;

	return <Provider value={client}>{children}</Provider>;
};

export default URQLProvider;
