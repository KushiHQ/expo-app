import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import TextArea from "@/components/atoms/a-textarea";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import DateInput from "@/components/molecules/m-date-input";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import SignatureImage from "@/components/molecules/m-signature-image";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	Gender,
	PaymentInterval,
	UpdateGuestMutation,
	UpdateGuestMutationVariables,
	useAuthGuestQuery,
	useHostingQuery,
} from "@/lib/services/graphql/generated";
import { UPDATE_GUEST } from "@/lib/services/graphql/requests/mutations/users";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { useGalleryStore } from "@/lib/stores/gallery";
import { useReservationStore } from "@/lib/stores/reservation";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { generateRNFile } from "@/lib/utils/file";
import { capitalize } from "@/lib/utils/text";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { MapPin } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function ReservationUserDetails() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const { gallery } = useGalleryStore();
	const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });
	const { input, updateInput } = useReservationStore();
	const [{ fetching: guestFetching, data: guestQueryData }, refetchGuest] =
		useAuthGuestQuery();
	const [uploading, setUploading] = React.useState(false);

	const hosting = data?.hosting;
	const loading = guestFetching || uploading;

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

	useFocusEffect(
		React.useCallback(() => {
			let signature = gallery.at(0);

			if (
				signature &&
				!guestQueryData?.authGuest.signature?.publicUrl &&
				!guestFetching
			) {
				setUploading(true);
				formMutation<UpdateGuestMutation, UpdateGuestMutationVariables>(
					UPDATE_GUEST,
					{
						input: {
							signature: generateRNFile(signature),
						},
					},
				)
					.then((res) => {
						if (res.error) {
							handleError(res.error);
						}
						if (res.data) {
							refetchGuest({ requestPolicy: "network-only" });
							Toast.show({
								type: "success",
								text1: "Success",
								text2: res.data.updateGuest.message,
							});
						}
					})
					.finally(() => setUploading(false));
			}
		}, [gallery]),
	);

	return (
		<>
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
								value={input.fullName}
								onChangeText={(v) => updateInput({ fullName: v })}
							/>
							<FloatingLabelInput
								focused
								label="Correspondence Address"
								suffix={
									<MapPin color={hexToRgba(colors.text, 0.8)} size={16} />
								}
								placeholder="A tenancy agreement will be adressed to this address"
								value={input.correspondenceAddress}
								onChangeText={(v) => updateInput({ correspondenceAddress: v })}
							/>
							<FloatingLabelInput
								inputMode="email"
								autoComplete="email"
								focused
								label="Email"
								placeholder="example@email.com"
								value={input.email}
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
										value={input.phoneNumber}
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
							<SignatureImage
								signature={guestQueryData?.authGuest.signature?.publicUrl}
								redirect={`/hostings/${id}/reservation/user-details`}
							/>
							<View className="mt-4 gap-4">
								<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
									Note to host (Optional)
								</ThemedText>
								<TextArea
									value={cast(input.noteToHost)}
									placeholder="Enter text..."
									onChangeText={(v) => updateInput({ noteToHost: v })}
								/>
							</View>
						</View>
					</View>
					<Button
						disabled={
							!input.correspondenceAddress ||
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
			<LoadingModal visible={loading} />
		</>
	);
}
