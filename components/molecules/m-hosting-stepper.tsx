import { View } from "react-native";
import Stepper from "../atoms/a-steppter";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "../atoms/a-button";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { useRouter } from "expo-router";
import BottomSheet from "../atoms/a-bottom-sheet";
import { Image } from "expo-image";
import { Fonts } from "@/lib/constants/theme";

type Props = {
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	step: number;
};

const HostingStepper: React.FC<Props> = ({
	step,
	disabled,
	loading,
	onPress,
}) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [success, setSuccess] = React.useState(false);

	const handleClose = () => {
		setSuccess(false);
		router.dismissAll();
		router.replace("/host/analytics");
	};

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
							type="primary"
							onPress={() => setSuccess(true)}
							className="px-8"
						>
							<ThemedText content="primary">Publish Listing</ThemedText>
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
			<BottomSheet isVisible={success} onClose={handleClose}>
				<View>
					<View className="items-center">
						<View className="items-center">
							<ThemedText
								className="text-center"
								style={{ fontFamily: Fonts.medium }}
							>
								🎉 Your listing has been submitted for review!
							</ThemedText>
							<ThemedText
								className="text-center max-w-[255px]"
								style={{ fontSize: 14 }}
							>
								Our team will verify and publish it shortly. You’ll be notified.
							</ThemedText>
						</View>
						<View
							style={{
								width: 250,
								height: 250,
							}}
						>
							<Image
								style={{
									width: 250,
									height: 250,
									objectFit: "cover",
								}}
								source={require("@/assets/images/success-check.png")}
							/>
						</View>
					</View>
					<View className="gap-4">
						<Button type="primary" onPress={handleClose}>
							<ThemedText content="primary">Go to Dashboard</ThemedText>
						</Button>
						<Button type="tinted" onPress={() => router.push("/host/listings")}>
							<ThemedText content="tinted">Edit Listing</ThemedText>
						</Button>
					</View>
				</View>
			</BottomSheet>
		</>
	);
};

export default HostingStepper;
