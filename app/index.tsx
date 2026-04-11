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

export default function HomeScreen() {
	const { user, updateUser } = useUser();
	const [, refreshToken] = useRefreshTokenMutation();
	const router = useRouter();

	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			router.replace("/auth/sign-in");
		}, 30000);

		const handleRefreshToken = async () => {
			const tokens = await getAuthTokens();
			if (!tokens?.refresh) {
				return null;
			}
			return refreshToken({ input: { refreshToken: tokens.refresh } });
		};

		const initializeApp = async () => {
			try {
				if (!user?.email) {
					clearTimeout(timeoutId);
					router.replace("/onboarding");
					return;
				}

				const res = await handleRefreshToken();
				clearTimeout(timeoutId);

				if (!res || res?.error) {
					router.replace("/auth/sign-in");
					return;
				}

				if (res?.data?.refreshToken.data) {
					const tokens = res.data.refreshToken.data;
					await saveAuthTokens({
						access: tokens.token,
						refresh: tokens.refreshToken,
					});

					updateUser(tokens.user);

					if (user.userType === UserType.Host) {
						router.replace("/host/analytics");
					} else {
						router.replace("/guest/home");
					}
				}
			} catch (error) {
				console.error("Initialization failed:", error);
				clearTimeout(timeoutId);
				router.replace("/auth/sign-in");
			}
		};

		initializeApp();

		return () => clearTimeout(timeoutId);
	}, [user?.email, user?.userType, refreshToken, router, updateUser]);

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
