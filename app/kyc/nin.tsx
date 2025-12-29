import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import Stepper from "@/components/atoms/a-steppter";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { KYC_ONBOARDING_STEPS } from "@/lib/constants/kyc/onboarding";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { User, useVerifyKycMutation } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, View } from "react-native";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function KycNIN() {
	const { user, updateUser } = useUser();
	const router = useRouter();
	const colors = useThemeColors();
	const [nin, setNin] = React.useState("");
	const [{ fetching: verifying }, verifyKyc] = useVerifyKycMutation();

	const handleVerify = () => {
		verifyKyc({ input: { nin } }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "NIN verified successfully",
				});
				updateUser({
					user: {
						...(user.user ?? ({} as User)),
						kyc: res.data.verifyKyc,
					},
				});
			}
		});
	};

	return (
		<>
			<DetailsLayout
				title="ID Verification"
				footer={
					<View
						className="p-4 border-t"
						style={{
							backgroundColor: colors.background,
							borderColor: hexToRgba(colors.text, 0.2),
						}}
					>
						<Button
							disabled={!user.user?.kyc?.ninVerified}
							onPress={() => router.push("/kyc/bvn")}
							type="primary"
							className="py-[18px]"
						>
							<ThemedText content="primary">Continue</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-4">
					<Stepper
						steps={KYC_ONBOARDING_STEPS.length}
						currentStep={3}
						titles={cast(KYC_ONBOARDING_STEPS)}
					/>
					<View>
						<View className="items-center mt-8">
							<Image
								style={{
									width: SCREEN_WIDTH * 0.9,
									maxWidth: 500,
									aspectRatio: 16 / 14,
									objectFit: "contain",
								}}
								source={require("@/assets/images/id-3d.png")}
							/>
						</View>

						<ThemedText
							type="subtitle"
							className="text-center self-center"
							style={{ color: hexToRgba(colors.text, 0.7) }}
						>
							Please enter the National Identification Number (NIN) associated
							with the photo you captured.
						</ThemedText>
						<View className="mt-8">
							<FloatingLabelInput
								label="NIN"
								focused
								inputMode="numeric"
								placeholder="021234569"
								disabled={!!user.user?.kyc.ninVerified}
								value={user.user?.kyc.ninVerified ? "***********" : nin}
								onChangeText={setNin}
							/>
							<View className="mt-4 items-center">
								<Button
									onPress={handleVerify}
									disabled={
										user.user?.kyc.ninVerified ? false : nin.length !== 11
									}
									className="w-full max-w-[200px]"
									style={{
										backgroundColor: user.user?.kyc.ninVerified
											? colors.success
											: colors.primary,
									}}
								>
									<ThemedText
										content="primary"
										style={{
											color: user.user?.kyc.ninVerified
												? colors["success-content"]
												: colors["primary-content"],
										}}
									>
										{user.user?.kyc.ninVerified ? "Verified" : "Confirm"}
									</ThemedText>
								</Button>
							</View>
						</View>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={verifying} />
		</>
	);
}
