import { View } from "react-native";
import Stepper from "../atoms/a-steppter";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "../atoms/a-button";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { useRouter } from "expo-router";

type Props = {
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	onTogglePublish?: () => void;
	published?: boolean;
	step: number;
};

const HostingStepper: React.FC<Props> = ({
	step,
	disabled,
	loading,
	onTogglePublish,
	published,
	onPress,
}) => {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<>
			<View
				className="px-6 pb-4 gap-4"
				style={{ backgroundColor: colors.background }}
			>
				<Stepper
					steps={ONBOARDING_STEPS.length}
					currentStep={step + 1}
					titles={["Start Hosting", ...ONBOARDING_STEPS.map((s) => s.title)]}
				/>
				{step === ONBOARDING_STEPS.length - 1 ? (
					<View className="flex-row justify-between">
						<Button
							type="tinted"
							onPress={() => router.back()}
							className="px-8"
						>
							<ThemedText content="tinted">Back</ThemedText>
						</Button>
						<Button
							disabled={disabled}
							type="primary"
							onPress={onTogglePublish}
							className="px-8"
						>
							<ThemedText content="primary">
								{!published ? "Publish" : "Unpublish"} Listing
							</ThemedText>
						</Button>
					</View>
				) : (
					<Button
						loading={loading}
						disabled={disabled}
						onPress={() => {
							onPress?.();
						}}
						type="primary"
					>
						<ThemedText content="primary">Continue</ThemedText>
					</Button>
				)}
			</View>
		</>
	);
};

export default HostingStepper;
