import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";
import { View } from "react-native";

type Props = {
	onNext?: () => void;
};

const GettingStartedStep3: React.FC<Props> = ({ onNext }) => {
	const colors = useThemeColors();
	return (
		<View className="mt-16">
			<View className="gap-6">
				<ThemedText
					style={{ color: colors["primary"], fontSize: 28 }}
					className="text-center"
					type="title"
				>
					Easily List & Sell Your Property
				</ThemedText>
				<ThemedText className="text-center">
					Upload photos, set your price, and get verified buyers quickly.
				</ThemedText>
			</View>
			<Button
				onPress={onNext}
				style={{ backgroundColor: colors["primary"] }}
				className="mt-24"
			>
				<ThemedText style={{ color: colors["primary-content"] }}>
					Next
				</ThemedText>
			</Button>
		</View>
	);
};

export default GettingStartedStep3;
