import { Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
import React from "react";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { useUser } from "@/lib/hooks/user";
import { useRouter } from "expo-router";

type Props = {
	step: (typeof KYC_ONBOARDING_STEPS)[number];
};

const KycStepButton: React.FC<Props> = ({ step }) => {
	const colors = useThemeColors();
	const { user } = useUser();
	const router = useRouter();

	const disabled = React.useMemo(() => {
		if (step === "Verify NIN") {
			return !user.user?.kyc?.image?.publicUrl;
		} else if (step === "Verify BVN") {
			return !user.user?.kyc?.image?.publicUrl || !user.user.kyc.ninVerified;
		}
		return false;
	}, [step, user]);

	const complete = React.useMemo(() => {
		if (step === "Take A Selfie") {
			return !!user.user?.kyc?.image?.publicUrl;
		} else if (step === "Verify BVN") {
			return !!user.user?.kyc?.bvnVerified;
		} else if (step === "Verify NIN") {
			return !!user.user?.kyc?.ninVerified;
		}
		return true;
	}, [step, user]);

	function handlePress() {
		if (disabled) return;
		if (step === "Take A Selfie") {
			router.push("/kyc/image");
		} else if (step === "Verify NIN") {
			router.push("/kyc/nin");
		} else if (step === "Verify BVN") {
			router.push("/kyc/bvn");
		} else {
			return;
		}
	}

	return (
		<Pressable
			onPress={handlePress}
			style={{
				backgroundColor: hexToRgba(
					complete ? colors.primary : colors.text,
					complete ? 0.18 : 0.15,
				),
				opacity: disabled ? 0.5 : 1,
			}}
			className="p-2 rounded px-4"
		>
			<ThemedText
				className="whitespace-nowrap"
				style={{ color: complete ? colors.primary : colors.text }}
			>
				{KYC_ONBOARDING_STEPS.indexOf(step) + 1}. {step}
			</ThemedText>
		</Pressable>
	);
};

export default KycStepButton;
