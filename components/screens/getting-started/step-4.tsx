import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";
import { View } from "react-native";

type Props = {
	onNext?: () => void;
};

const GettingStartedStep4: React.FC<Props> = ({ onNext }) => {
	const colors = useThemeColors();
	return (
		<View className="mt-16">
			<View className="gap-6">
				<ThemedText
					style={{ color: colors["primary"], fontSize: 28 }}
					className="text-center"
					type="title"
				>
					Safe & Secure Payments
				</ThemedText>
				<ThemedText className="text-center">
					Verified listings and trusted payments ensure worry-free transactions.
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

export default GettingStartedStep4;
