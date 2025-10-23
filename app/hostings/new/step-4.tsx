import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import BankSelectOption from "@/components/molecules/m-bank-select-option";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import TextSelectButton from "@/components/molecules/m-text-select-button";
import { Fonts } from "@/lib/constants/theme";
import { useBanksQuery } from "@/lib/services/external/banks";
import { FACILITIES, HOSTING_VARIANTS } from "@/lib/types/enums/hostings";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function NewHostingStep4() {
	const { data } = useBanksQuery();
	const [facilities, setFacilities] = React.useState<string[]>([]);

	const toggleFacilitySelect = (facility: string) => {
		setFacilities((c) => {
			if (c.includes(facility)) {
				return c.filter((v) => v !== facility);
			} else {
				return [...c, facility];
			}
		});
	};

	return (
		<DetailsLayout title="Hosting" footer={<HostingStepper step={4} />}>
			<View className="mt-4 gap-4">
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
				<View className="mt-4 gap-3">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Inform your guests about the amenities and features your place
						provides.
					</ThemedText>
					<SimpleGrid
						listKey={undefined}
						itemDimension={150}
						data={FACILITIES}
						spacing={0}
						renderItem={({ item }) => (
							<View className="mr-2 my-1">
								<TextSelectButton
									value={item}
									onSelect={toggleFacilitySelect}
									selected={facilities.includes(item)}
								/>
							</View>
						)}
					/>
				</View>
			</View>
		</DetailsLayout>
	);
}
