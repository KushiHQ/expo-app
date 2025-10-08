import ThemedView from "@/components/atoms/a-themed-view";
import Logo from "../assets/vectors/logo.svg";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingDots from "@/components/atoms/a-loading-dots";
import React from "react";
import { useRouter } from "expo-router";

export default function HomeScreen() {
	const router = useRouter();
	React.useEffect(() => {
		const timeout = setTimeout(() => {
			router.replace("/onboarding");
		}, 2000);

		return () => {
			clearTimeout(timeout);
		};
	}, [router]);

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
