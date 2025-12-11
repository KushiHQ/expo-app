import ThemedView from "@/components/atoms/a-themed-view";
import Logo from "../assets/vectors/logo.svg";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingDots from "@/components/atoms/a-loading-dots";
import React from "react";
import { useRouter } from "expo-router";
import { useRefreshTokenMutation } from "@/lib/services/graphql/generated";
import { getAuthTokens, saveAuthTokens } from "@/lib/utils/auth";
import { useUser } from "@/lib/hooks/user";
import { handleError } from "@/lib/utils/error";

export default function HomeScreen() {
	const { user, updateUser } = useUser();
	const [, refreshToken] = useRefreshTokenMutation();
	const router = useRouter();

	React.useEffect(() => {
		(async () => {
			if (!user.email) {
				router.replace("/onboarding");
			} else {
				const tokens = await getAuthTokens();
				if (!tokens?.refresh) {
					router.replace("/auth/sign-in");
				} else {
					refreshToken({ input: { refreshToken: tokens?.refresh } }).then(
						(res) => {
							if (res.error) {
								handleError(res.error);
								router.replace("/auth/sign-in");
							}
							if (res.data?.refreshToken.data) {
								updateUser(res.data.refreshToken.data.user);
								const tokens = res.data.refreshToken.data;
								saveAuthTokens({
									access: tokens.token,
									refresh: tokens.refreshToken,
								});
								router.replace("/guest/home");
							}
						},
					);
				}
			}
		})();
	}, [user]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ThemedView style={styles.container}>
				<Logo />
				<LoadingDots styles={styles.loader} />
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	loader: {
		position: "absolute",
		bottom: 40,
	},
});
