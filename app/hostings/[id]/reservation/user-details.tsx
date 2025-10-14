import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import DateInput from "@/components/molecules/m-date-input";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import { View } from "react-native";

export default function ReservationUserDetails() {
	const [gender, setGender] = React.useState<string>();
	const [userType, setUserType] = React.useState<string>();

	return (
		<DetailsLayout title="Reservation Details">
			<View className="mt-8">
				<ThemedText style={{ fontSize: 18, fontFamily: Fonts.bold }}>
					Your Information Details
				</ThemedText>
			</View>
			<View className="mt-5 gap-5">
				<FloatingLabelInput
					autoComplete="name"
					focused
					label="Fullname"
					placeholder="John Doe"
				/>
				<FloatingLabelInput
					inputMode="email"
					autoComplete="email"
					focused
					label="Email"
					placeholder="example@email.com"
				/>
				<FloatingLabelInput
					inputMode="tel"
					autoComplete="tel"
					focused
					label="Phone Number"
					placeholder="08034598710"
				/>
				<View className="flex-row gap-4">
					<SelectInput
						focused
						value={gender}
						label="Gender"
						placeholder="Male"
						onSelect={(v) => setGender(v.label)}
						options={["Male", "Female"].map((v) => ({ label: v, value: v }))}
						renderItem={SelectOption}
					/>
					<SelectInput
						focused
						value={userType}
						label="User Type"
						placeholder="Guest"
						onSelect={(v) => setUserType(v.label)}
						options={["Host", "Guest"].map((v) => ({ label: v, value: v }))}
						renderItem={SelectOption}
					/>
				</View>
				<View className="flex-row gap-4">
					<DateInput focused label="Check In" placeholder="01/01/2025" />
					<DateInput focused label="Check Out" placeholder="01/01/2025" />
				</View>
			</View>
		</DetailsLayout>
	);
}
