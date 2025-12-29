import ThemedSwitch from "@/components/atoms/a-themed-switch";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { hexToRgba } from "@/lib/utils/colors";
import { ImageBackground } from "expo-image";
import { Link, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function NewHosting() {
	const { user } = useUser();
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<DetailsLayout
			title="Hosting"
			footer={
				<HostingStepper
					disabled={
						!(!!user.user?.kyc.ninVerified && !!user.user.kyc.bvnVerified)
					}
					onPress={() => {
						router.push("/hostings/form/step-1");
					}}
					step={0}
				/>
			}
		>
			<View className="mt-8">
				<View className="gap-4">
					<View className="flex-row items-center justify-between">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							KYC Application
						</ThemedText>
						<ThemedSwitch
							value={
								!!user.user?.kyc.ninVerified && !!user.user.kyc.bvnVerified
							}
							onValueChange={() => {
								if (
									!(!!user.user?.kyc.ninVerified && !!user.user.kyc.bvnVerified)
								) {
									router.push("/kyc");
								}
							}}
						/>
					</View>
					{!(!!user.user?.kyc.ninVerified && !!user.user.kyc.bvnVerified) && (
						<ThemedText style={{ fontSize: 12 }}>
							Unfortunately, your KYC application has not been completed. Please
							fill out the KYC form before you can access the hosting services.{" "}
							<Link
								href="/kyc"
								style={{ color: colors.accent }}
								className="underline"
							>
								Submit your KYC application.
							</Link>
						</ThemedText>
					)}
				</View>
				<View>
					<View className="rounded-lg overflow-hidden mt-8">
						<ImageBackground
							source={require("@/assets/images/hosting-hero.png")}
						>
							<View className="h-[94px] items-end justify-center">
								<ThemedText
									className="max-w-[220px] pr-8"
									style={{ fontFamily: Fonts.bold, color: colors.accent }}
								>
									Welcome! Ready to List Your Property?
								</ThemedText>
							</View>
						</ImageBackground>
					</View>
					<View className="px-10 mt-2">
						<ThemedText className="text-center" style={{ fontSize: 12 }}>
							Connect with serious renters and buyers in your area. We’ll walk
							you through each step.
						</ThemedText>
					</View>
				</View>
				<View className="gap-4 mt-8">
					{ONBOARDING_STEPS.map((step, index) => {
						const Icon = step.icon;
						return (
							<View
								key={index}
								className="flex-row items-center gap-4 rounded-3xl border p-[14px]"
								style={{ borderColor: hexToRgba(colors.text, 0.15) }}
							>
								<View
									className="w-12 h-12 items-center justify-center rounded-full border"
									style={{
										backgroundColor: hexToRgba(colors.primary, 0.1),
										borderColor: hexToRgba(colors.text, 0.1),
									}}
								>
									<Icon size={20} color={colors.text} />
								</View>
								<View className="flex-1">
									<ThemedText style={{ fontFamily: Fonts.bold }}>
										{step.title}
									</ThemedText>
									<ThemedText
										style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
									>
										{step.description}
									</ThemedText>
								</View>
							</View>
						);
					})}
				</View>
			</View>
		</DetailsLayout>
	);
}
