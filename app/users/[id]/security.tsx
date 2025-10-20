import ThemedSwitch from "@/components/atoms/a-themed-switch";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import BiometricsVerification from "@/components/molecules/m-biometriecs-verification";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { securitySettingsAtom } from "@/lib/stores/security-settings";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

export default function UserSecurity() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [biometrics, setBiometrics] = React.useState<"pay" | "auth">();
	const [securitySettings, setSecuritySettings] = useAtom(securitySettingsAtom);

	const handleSuccess = () => {
		if (biometrics === "auth") {
			setSecuritySettings((c) => ({ ...c, biometrics: true }));
		} else {
			setSecuritySettings((c) => ({ ...c, payWithBiometrics: true }));
		}
		setBiometrics(undefined);
	};

	return (
		<>
			<DetailsLayout title="Security">
				<View className="mt-6 gap-8">
					<View className="flex-row items-center justify-between">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							Biometrics
						</ThemedText>
						<ThemedSwitch
							value={securitySettings.biometrics}
							onValueChange={(value) =>
								value
									? setBiometrics("auth")
									: setSecuritySettings((c) => ({ ...c, biometrics: false }))
							}
						/>
					</View>
					<View className="flex-row items-center justify-between">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							Pay With Biometrics
						</ThemedText>
						<ThemedSwitch
							value={securitySettings.payWithBiometrics}
							onValueChange={(value) =>
								value
									? setBiometrics("pay")
									: setSecuritySettings((c) => ({
											...c,
											payWithBiometrics: false,
										}))
							}
						/>
					</View>
					<View className="flex-row items-center justify-between">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							KYC Application
						</ThemedText>
						<ThemedSwitch
							value={securitySettings.kyc}
							onValueChange={() => {}}
						/>
					</View>
					<Pressable
						onPress={() => router.push(`/users/${id}/change-pin`)}
						className="flex-row items-center justify-between"
					>
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							Change PIN
						</ThemedText>
						<ChevronRight color={colors.text} />
					</Pressable>
					<Pressable
						onPress={() => router.push(`/users/${id}/update-password`)}
						className="flex-row items-center justify-between"
					>
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							Change Password
						</ThemedText>
						<ChevronRight color={colors.text} />
					</Pressable>
				</View>
			</DetailsLayout>
			<BiometricsVerification
				open={!!biometrics}
				onSuccess={handleSuccess}
				onCancel={() => setBiometrics(undefined)}
			/>
		</>
	);
}
