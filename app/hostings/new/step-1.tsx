import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { HOSTING_VARIANTS } from "@/lib/types/enums/hostings";
import { View } from "react-native";

export default function NewHostingStep1() {
	return (
		<DetailsLayout
			title="Property Details"
			footer={<HostingStepper step={1} />}
		>
			<View className="mt-8 gap-4">
				<FloatingLabelInput
					focused
					label="Title"
					placeholder="4 Bedroom Appartment"
				/>
				<View className="flex-row gap-4">
					<SelectInput
						focused
						label="Property Type"
						placeholder="Residential"
						options={HOSTING_VARIANTS.map((v) => ({ label: v, value: v }))}
						renderItem={SelectOption}
					/>
					<SelectInput
						focused
						label="Listing Type"
						placeholder="Rent"
						options={["Sale", "Rent"].map((v) => ({
							label: `For ${v}`,
							value: v,
						}))}
						renderItem={SelectOption}
					/>
				</View>
				<FloatingLabelInput
					focused
					multiline
					label="Description"
					placeholder="A 4 bedroom bungalow with a spacious compound..."
					containerStyle={{ minHeight: 200 }}
					numberOfLines={6}
				/>
			</View>
		</DetailsLayout>
	);
}
