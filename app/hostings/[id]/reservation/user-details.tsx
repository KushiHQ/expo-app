import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import TextArea from "@/components/atoms/a-textarea";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import DateInput from "@/components/molecules/m-date-input";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { Fonts } from "@/lib/constants/theme";
import {
	Gender,
	PaymentInterval,
	useHostingQuery,
} from "@/lib/services/graphql/generated";
import { useReservationStore } from "@/lib/stores/reservation";
import { cast } from "@/lib/types/utils";
import { capitalize } from "@/lib/utils/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function ReservationUserDetails() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });
	const { input, updateInput } = useReservationStore();

	const hosting = data?.hosting;

	React.useEffect(() => {
		const startDate = new Date();
		const endDate = new Date(startDate);

		switch (hosting?.paymentInterval) {
			case PaymentInterval.Nightly:
				endDate.setDate(endDate.getDate() + 1);
				break;
			case PaymentInterval.Weekly:
				endDate.setDate(endDate.getDate() + 7);
				break;
			case PaymentInterval.Monthly:
				endDate.setMonth(endDate.getMonth() + 1);
				break;
			case PaymentInterval.Anually:
				endDate.setFullYear(endDate.getFullYear() + 1);
				break;
			case PaymentInterval.OneTimePayment:
				break;
		}

		updateInput({
			checkOutDate: endDate.toISOString().split("T")[0],
			checkInDate: startDate.toISOString().split("T")[0],
		});
	}, [hosting]);

	return (
		<DetailsLayout title="Reservation Details">
			<View className="flex-1 gap-4 justify-between">
				<View>
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
							onChangeText={(v) => updateInput({ fullName: v })}
						/>
						<FloatingLabelInput
							inputMode="email"
							autoComplete="email"
							focused
							label="Email"
							placeholder="example@email.com"
							onChangeText={(v) => updateInput({ email: v })}
						/>
						<View className="flex-row gap-4">
							<View className="flex-1">
								<FloatingLabelInput
									inputMode="tel"
									autoComplete="tel"
									focused
									label="Phone Number"
									placeholder="08034598710"
									onChangeText={(v) => updateInput({ phoneNumber: v })}
								/>
							</View>
							<SelectInput
								focused
								value={input.gender}
								label="Gender"
								placeholder="Male"
								onSelect={(v) => updateInput({ gender: v.value })}
								options={Object.values(Gender).map((v) => ({
									label: capitalize(v),
									value: v,
								}))}
								renderItem={SelectOption}
							/>
						</View>
						<View className="flex-row gap-4">
							<DateInput
								disabled
								value={
									input.checkInDate
										? new Date(input.checkInDate).toLocaleDateString()
										: ""
								}
								focused
								label="Check In"
								placeholder="01/01/2025"
							/>
							<DateInput
								disabled
								value={
									input.checkOutDate
										? new Date(input.checkOutDate).toLocaleDateString()
										: ""
								}
								focused
								label="Check Out"
								placeholder="01/01/2025"
							/>
						</View>
						<View className="mt-4 gap-4">
							<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
								Note to host (Optional)
							</ThemedText>
							<TextArea
								placeholder="Enter text..."
								onChangeText={(v) => updateInput({ noteToHost: v })}
							/>
						</View>
					</View>
				</View>
				<Button
					disabled={
						!input.fullName ||
						!input.email ||
						!input.phoneNumber ||
						!input.gender ||
						!input.checkInDate ||
						!input.checkOutDate
					}
					onPress={() =>
						router.push(`/hostings/${id}/reservation/payment-method/`)
					}
					type="primary"
				>
					<ThemedText content="primary">Continue</ThemedText>
				</Button>
			</View>
		</DetailsLayout>
	);
}
