import Stepper from "@/components/atoms/a-steppter";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
import { cast } from "@/lib/types/utils";
import { View } from "react-native";

export default function KycImage() {
	return (
		<DetailsLayout title={KYC_ONBOARDING_STEPS[1]}>
			<View className="mt-4">
				<Stepper
					steps={KYC_ONBOARDING_STEPS.length}
					currentStep={2}
					titles={cast(KYC_ONBOARDING_STEPS)}
				/>
				<View className="mt-8">
					<View className="max-w-[400px] self-center">
						<ThemedText
							type="semibold"
							style={{ fontSize: 20 }}
							className="text-center self-center"
						>
							Facial Recognition
						</ThemedText>
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}
