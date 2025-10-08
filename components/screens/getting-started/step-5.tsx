import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { View } from "react-native";

const GettingStartedStep5: React.FC = () => {
	const colors = useThemeColors();
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
				<Button style={{ backgroundColor: colors["primary"] }}>
					<ThemedText style={{ color: colors["primary-content"] }}>
						Sign up / Log in
					</ThemedText>
				</Button>
				<Button style={{ backgroundColor: hexToRgba(colors["primary"], 0.15) }}>
					<ThemedText style={{ color: colors["primary"] }}>Explore</ThemedText>
				</Button>
			</View>
		</View>
	);
};

export default GettingStartedStep5;
