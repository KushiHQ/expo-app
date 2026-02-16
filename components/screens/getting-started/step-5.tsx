import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

const GettingStartedStep5: React.FC = () => {
	const colors = useThemeColors();
	const router = useRouter();

	return (
		<View className="mt-16">
			<View className="gap-6">
				<ThemedText
					style={{ color: colors["primary"], fontSize: 28 }}
					className="text-center"
					type="title"
				>
					Let’s Find Your Dream Home
				</ThemedText>
				<ThemedText style={{ fontSize: 18 }} className="text-center">
					Sign up and explore thousands of homes today.
				</ThemedText>
			</View>
			<View className="gap-4 mt-24">
				<Button onPress={() => router.push("/auth/sign-up")} type="primary">
					<ThemedText content="primary">Sign up / Log in</ThemedText>
				</Button>
				<Button type="tinted" onPress={() => router.push("/guest/home")}>
					<ThemedText content="tinted">Explore</ThemedText>
				</Button>
			</View>
		</View>
	);
};

export default GettingStartedStep5;
