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
import { UserType } from "@/lib/types/users";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, View } from "react-native";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function KycBVN() {
	const { user, updateUser } = useUser();
	const router = useRouter();
	const colors = useThemeColors();
	const [bvn, setBvn] = React.useState("");
	const [{ fetching: verifying }, verifyKyc] = useVerifyKycMutation();

	const handleVerify = () => {
		verifyKyc({ input: { bvn } }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "BVN verified successfully",
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
				title="BVN Verification"
				footer={
					<View
						className="p-4 border-t"
						style={{
							backgroundColor: colors.background,
							borderColor: hexToRgba(colors.text, 0.2),
						}}
					>
						<Button
							disabled={!user.user?.kyc?.bvnVerified}
							onPress={() => {
								if (user.userType === UserType.Host) {
									router.replace("/host/analytics");
								} else {
									router.replace("/guest/home");
								}
							}}
							type="primary"
							className="py-[18px]"
						>
							<ThemedText content="primary">Finish</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-4">
					<Stepper
						steps={KYC_ONBOARDING_STEPS.length}
						currentStep={4}
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
								source={require("@/assets/images/card-security-3d.png")}
							/>
						</View>

						<ThemedText
							type="subtitle"
							className="text-center self-center"
							style={{ color: hexToRgba(colors.text, 0.7) }}
						>
							Please enter the Bank Verification Number (BVN) associated with
							the photo you captured.
						</ThemedText>
						<View className="mt-8">
							<FloatingLabelInput
								label="BVN"
								focused
								inputMode="numeric"
								maxLength={11}
								placeholder="021234569"
								disabled={!!user.user?.kyc.bvnVerified}
								value={user.user?.kyc.bvnVerified ? "***********" : bvn}
								onChangeText={setBvn}
							/>
							<View className="mt-4 items-center">
								<Button
									onPress={handleVerify}
									disabled={
										user.user?.kyc.bvnVerified ? false : bvn.length !== 11
									}
									className="w-full max-w-[200px]"
									style={{
										backgroundColor: user.user?.kyc.bvnVerified
											? colors.success
											: colors.primary,
									}}
								>
									<ThemedText
										content="primary"
										style={{
											color: user.user?.kyc.bvnVerified
												? colors["success-content"]
												: colors["primary-content"],
										}}
									>
										{user.user?.kyc.bvnVerified ? "Verified" : "Confirm"}
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
