import { View } from "react-native";
import Stepper from "../atoms/a-steppter";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "../atoms/a-button";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { useRouter } from "expo-router";

type Props = {
	step: number;
};

const HostingStepper: React.FC<Props> = ({ step }) => {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<View
			className="px-6 py-4 gap-2"
			style={{ backgroundColor: colors.background }}
		>
			<Stepper
				steps={ONBOARDING_STEPS.length + 1}
				currentStep={step + 1}
				titles={["Start Hosting", ...ONBOARDING_STEPS.map((s) => s.title)]}
			/>
			<Button
				onPress={() => router.push(`/hostings/new/step-${step + 1}`)}
				type="primary"
			>
				<ThemedText content="primary">Continue</ThemedText>
			</Button>
		</View>
	);
};

export default HostingStepper;
