import Button from "@/components/atoms/a-button";
import Stepper from "@/components/atoms/a-steppter";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import KycStepButton from "@/components/molecules/m-kyc-step-button";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
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
						onPress={() => router.push("/kyc/image")}
						type="primary"
						className="py-[18px]"
					>
						<ThemedText content="primary">Start Verification</ThemedText>
					</Button>
				</View>
			}
		>
			<View className="mt-4">
				<Stepper
					steps={KYC_ONBOARDING_STEPS.length}
					currentStep={1}
					titles={cast(KYC_ONBOARDING_STEPS)}
				/>
				<View className="mt-8">
					<View className="max-w-[400px] self-center">
						<ThemedText
							type="semibold"
							style={{ fontSize: 20 }}
							className="text-center self-center"
						>
							Verify your Identity to{" "}
							{user.userType === UserType.Host ? "List" : "Book"} Properties
						</ThemedText>
						<ThemedText
							type="subtitle"
							className="text-center mt-4"
							style={{ color: hexToRgba(colors.text, 0.7) }}
						>
							This helps us to secure your account and comply with regulations
						</ThemedText>
					</View>
					<View className="items-center mt-8">
						<Image
							style={{
								width: 280,
								height: 400,
								objectFit: "contain",
							}}
							source={require("@/assets/images/kyc-3d.png")}
						/>
					</View>
					<View className="mt-12">
						<ThemedText type="semibold">Steps:</ThemedText>
						<View className="flex-wrap flex-row gap-4 mt-4">
							{KYC_ONBOARDING_STEPS.map((step) => (
								<KycStepButton step={step} key={step} />
							))}
						</View>
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}
