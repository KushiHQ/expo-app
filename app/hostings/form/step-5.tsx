import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import BankSelectOption from "@/components/molecules/m-bank-select-option";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useBanksQuery } from "@/lib/services/external/banks";
import { hexToRgba } from "@/lib/utils/colors";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export default function NewHostingStep5() {
	const colors = useThemeColors();
	const { data } = useBanksQuery();

	return (
		<DetailsLayout title="Hosting" footer={<HostingStepper step={4} />}>
			<View className="mt-2 gap-4">
				<ThemedText
					style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
				>
					<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
					{"  "}
					Set your Price, Payment Interval (e.g., Annually), and the Bank
					Account where you want to receive payments. Finally, select all the
					Amenities and features your property offers.
				</ThemedText>
				<ThemedText style={{ fontFamily: Fonts.medium }}>
					Pricing, Features & Amenities
				</ThemedText>
				<View className="flex-row items-center gap-4">
					<View className="flex-1">
						<FloatingLabelInput
							focused
							inputMode="numeric"
							label="Account Number"
							placeholder="Payments will be transfered here"
						/>
					</View>
					<SelectInput
						focused
						searchable
						searchField="name"
						label="Bank"
						placeholder="Select bank"
						renderItem={BankSelectOption}
						options={data ?? []}
					/>
				</View>
				<View className="flex-row gap-4">
					<SelectInput
						focused
						label="Payment Interval"
						placeholder="Anually"
						options={["Nightly", "Weekly", "Monthly", "Anually"].map((v) => ({
							label: v,
							value: v,
						}))}
						renderItem={SelectOption}
					/>
					<View className="flex-1">
						<FloatingLabelInput
							focused
							inputMode="numeric"
							label="Price"
							placeholder="100,000 (₦)"
						/>
					</View>
				</View>
			</View>
		</DetailsLayout>
	);
}
