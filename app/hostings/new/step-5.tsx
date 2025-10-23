import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import Button from "@/components/atoms/a-button";
import { FluentSlideTextEdit28Regular } from "@/components/icons/i-edit";
import { Href, useRouter } from "expo-router";
import { Home } from "lucide-react-native";
import Checkbox from "@/components/atoms/a-checkbox";

type ItemSummaryProps = {
	label: string;
	summary: string;
};

const ItemSummary: React.FC<ItemSummaryProps> = ({ label, summary }) => {
	const colors = useThemeColors();

	return (
		<View className="flex-row items-center gap-2">
			<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
				{label}:
			</ThemedText>
			<ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}>
				{summary}
			</ThemedText>
		</View>
	);
};

const EditButton: React.FC<{ href: Href }> = ({ href }) => {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<Button
			onPress={() => router.push(href)}
			style={{ alignSelf: "flex-end", borderRadius: 8 }}
			type="shade"
			className="py-2"
		>
			<View className="flex-row items-center gap-2">
				<ThemedText content="shade" style={{ fontSize: 14 }}>
					Edit
				</ThemedText>
				<FluentSlideTextEdit28Regular
					color={colors["shade-content"]}
					size={16}
				/>
			</View>
		</Button>
	);
};

const SummarySection: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => {
	const colors = useThemeColors();
	return (
		<View
			className="p-3 rounded gap-2"
			style={{
				borderWidth: 2,
				borderStyle: "dashed",
				borderColor: hexToRgba(colors.primary, 0.4),
				backgroundColor: hexToRgba(colors.primary, 0.1),
			}}
		>
			{children}
		</View>
	);
};

export default function NewHostingStep5() {
	const colors = useThemeColors();

	return (
		<DetailsLayout title="Hosting" footer={<HostingStepper step={5} />}>
			<View className="mt-4 gap-4">
				<ThemedText style={{ fontFamily: Fonts.medium }}>
					Overview of Collected Information
				</ThemedText>
				<View className="border p-2 rounded-xl gap-3">
					<SummarySection>
						<ItemSummary label="Title" summary="Luxury 3 Bedroom Appartment" />
						<ItemSummary label="Property Type" summary="Residential" />
						<ItemSummary label="Listing Type" summary="Rent" />
						<View>
							<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
								Description
							</ThemedText>
							<ThemedText style={{ fontSize: 13, color: colors.primary }}>
								Discover this stunning 3-bedroom apartment in Lekki Phase 1,
								featuring 3 modern bathrooms. Enjoy top-notch amenities
								including a refreshing pool, reliable electricity, 24/7
								security, and convenient parking. Perfect for a comfortable
								lifestyle!
							</ThemedText>
						</View>
						<EditButton href={"/hostings/new/step-1"} />
					</SummarySection>
					<SummarySection>
						<View className="flex-row gap-4">
							<ItemSummary label="Bedrooms" summary="3" />
							<ItemSummary label="Bathrooms" summary="2" />
						</View>
						<View className="flex-row gap-4">
							<ItemSummary label="Kitchen" summary="1" />
							<ItemSummary label="Images" summary="23" />
						</View>
						<EditButton href={"/hostings/new/step-2"} />
					</SummarySection>
					<SummarySection>
						<View
							className="p-4 border rounded-xl gap-3"
							style={{
								borderColor: hexToRgba(colors.primary, 0.15),
								backgroundColor: colors.background,
								...Platform.select({
									ios: {
										shadowColor: colors.primary,
										shadowOffset: { width: 0, height: -2 },
										shadowOpacity: 0.1,
										shadowRadius: 8,
									},
									android: {
										elevation: 8,
										shadowColor: hexToRgba(colors.primary, 0.3),
									},
								}),
							}}
						>
							<View className="flex-row items-center gap-2">
								<Home color={colors.primary} size={18} />
								<ThemedText style={{ fontFamily: Fonts.semibold }}>
									Address
								</ThemedText>
							</View>
							<View>
								<ThemedText style={{ fontSize: 12 }}>
									There Brother Street, Karu 900101,
								</ThemedText>
								<ThemedText style={{ fontSize: 14, fontFamily: Fonts.medium }}>
									Federal Capital Teritory, Nigeria
								</ThemedText>
							</View>
						</View>
						<ItemSummary label="Contact" summary="+2349035257499" />
						<ItemSummary
							label="Landmarks"
							summary="MTN Mast after commisioners house"
						/>
						<EditButton href={"/hostings/new/step-3"} />
					</SummarySection>
					<SummarySection>
						<ItemSummary label="Account Number" summary="2116780900" />
						<ItemSummary label="Bank" summary="United Bank For Africa" />
						<ItemSummary label="Payment Interval" summary="Yearly" />
						<ItemSummary label="Price" summary="₦750,000" />
						<EditButton href={"/hostings/new/step-4"} />
					</SummarySection>
				</View>
				<View className="gap-2">
					<Pressable className="flex-row items-start gap-1">
						<Checkbox color={colors.primary} size={20} />
						<ThemedText className="flex-1" style={{ fontSize: 14 }}>
							I confirm that the above information is true and accurate.
						</ThemedText>
					</Pressable>
					<Pressable className="flex-row items-start gap-1">
						<Checkbox color={colors.primary} size={20} />
						<ThemedText className="flex-1" style={{ fontSize: 14 }}>
							I agree to Kushi's hosting terms of service
						</ThemedText>
					</Pressable>
				</View>
			</View>
		</DetailsLayout>
	);
}
