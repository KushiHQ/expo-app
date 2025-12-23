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
import { UserType } from "@/lib/types/users";
import { checkActiveCalls } from "@/lib/utils/call";
import { useStreamVideoClient } from "@stream-io/video-react-native-sdk";

export default function HomeScreen() {
	const { user, updateUser } = useUser();
	const [, refreshToken] = useRefreshTokenMutation();
	const router = useRouter();

	const client = useStreamVideoClient();

	React.useEffect(() => {
		const handleRefreshToken = async () => {
			const tokens = await getAuthTokens();
			if (!tokens?.refresh) {
				router.replace("/auth/sign-in");
			} else {
				return refreshToken({ input: { refreshToken: tokens?.refresh } });
			}
		};

		(async () => {
			console.log("REROUTING");
			if (!user.email) {
				router.replace("/onboarding");
			} else {
				handleRefreshToken().then(async (res) => {
					if (client) {
						await checkActiveCalls(client, user.user?.id ?? "", router);
					}
					if (res?.error) {
						router.replace("/auth/sign-in");
					}
					if (res?.data?.refreshToken.data) {
						updateUser(res.data.refreshToken.data.user);
						const tokens = res.data.refreshToken.data;
						saveAuthTokens({
							access: tokens.token,
							refresh: tokens.refreshToken,
						});
						if (user.userType === UserType.Host) {
							router.replace("/host/analytics");
						} else {
							router.replace("/guest/home");
						}
					}
				});
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
