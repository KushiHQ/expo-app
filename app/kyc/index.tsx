import Button from "@/components/atoms/a-button";
import Stepper from "@/components/atoms/a-steppter";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import KycStepButton from "@/components/molecules/m-kyc-step-button";
import { SolarShieldKeyholeBold } from "@/components/icons/i-shield";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { UserType } from "@/lib/types/users";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function KycHome() {
	const { user } = useUser();
	const router = useRouter();
	const colors = useThemeColors();

	const pendingStep = React.useMemo(() => {
		if (!user.user?.kyc?.image?.publicUrl) {
			return "Take A Selfie";
		}
		if (!user.user?.kyc?.ninVerified) {
			return "Verify NIN";
		}
		if (!user.user?.kyc?.bvnVerified) {
			return "Verify BVN";
		}
		return null;
	}, [user]);

	return (
		<DetailsLayout
			title="KYC Registration"
			footer={
				<View
					className="p-4 border-t"
					style={{
						backgroundColor: colors.background,
						borderColor: hexToRgba(colors.text, 0.2),
					}}
				>
					<Button
						onPress={() => {
							if (pendingStep === "Take A Selfie") router.push("/kyc/image");
							else if (pendingStep === "Verify NIN") router.push("/kyc/nin");
							else if (pendingStep === "Verify BVN") router.push("/kyc/bvn");
							else {
								if (user.userType === UserType.Host) {
									router.replace("/host/analytics");
								} else {
									router.replace("/guest/home");
								}
							}
						}}
						type="primary"
						className="py-[18px]"
					>
						<ThemedText content="primary">
							{pendingStep ? "Start Verification" : "Go to Dashboard"}
						</ThemedText>
					</Button>
				</View>
			}
		>
			<View className="mt-4">
				<Stepper
					steps={KYC_ONBOARDING_STEPS.length}
					currentStep={
						pendingStep
							? KYC_ONBOARDING_STEPS.indexOf(pendingStep) + 1
							: KYC_ONBOARDING_STEPS.length
					}
					titles={cast(KYC_ONBOARDING_STEPS)}
				/>
				<View className="mt-8">
					<View className="max-w-[400px] self-center items-center">
						<View
							className="flex-row items-center gap-1.5 px-3 py-1 rounded-full mb-4"
							style={{ backgroundColor: hexToRgba(colors.success, 0.1) }}
						>
							<SolarShieldKeyholeBold size={14} color={colors.success} />
							<ThemedText
								style={{
									fontSize: 12,
									color: colors.success,
									fontFamily: Fonts.medium,
								}}
							>
								Encrypted & Secure
							</ThemedText>
						</View>
						<ThemedText
							type="semibold"
							style={{ fontSize: 20 }}
							className="text-center self-center"
						>
							{pendingStep
								? `Verify your Identity to ${user.userType === UserType.Host ? "List" : "Book"} Properties`
								: "Verification Complete!"}
						</ThemedText>
						<ThemedText
							type="subtitle"
							className="text-center mt-4"
							style={{ color: hexToRgba(colors.text, 0.7) }}
						>
							{pendingStep
								? "This helps us to secure your account and comply with regulations"
								: "Your identity has been successfully verified. You can now access all features of the platform."}
						</ThemedText>
					</View>
					<View className="items-center mt-8">
						<Image
							style={{
								width: 280,
								height: 320,
								objectFit: "contain",
							}}
							source={
								pendingStep
									? require("@/assets/images/kyc-3d.png")
									: require("@/assets/images/success-check.png")
							}
						/>
					</View>
					<View className="mt-12">
						<ThemedText type="semibold">
							{pendingStep ? "Next Step:" : "Steps Completed:"}
						</ThemedText>
						<View className="flex-wrap flex-row gap-4 mt-4">
							{pendingStep ? (
								<KycStepButton step={pendingStep} />
							) : (
								KYC_ONBOARDING_STEPS.map((step) => (
									<KycStepButton step={step} key={step} />
								))
							)}
						</View>
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}
