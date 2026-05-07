import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import DateInput from "@/components/molecules/m-date-input";
import PhoneNumberSelectInput from "@/components/organisms/o-phone-number-select-input";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	PaymentInterval,
	useHostingQuery,
	useInitiateBookingApplicationMutation,
	useUpdateBookingApplicationMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { removeTypenames } from "@/lib/utils/graphql/cleanup";
import { useBookingApplicationStore } from "@/lib/stores/bookings";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	CircleQuestionMark,
} from "lucide-react-native";
import React from "react";
import { Pressable, RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";

export default function BookingApplicationStep1() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const { input, setInput, updateInput } = useBookingApplicationStore();
	const [
		{
			fetching: initiatingApplicaiton,
			data: initiateData,
			error: initiateError,
		},
		initiateApplication,
	] = useInitiateBookingApplicationMutation();
	const [{ fetching: updatingBookingApplication, error }, mutate] =
		useUpdateBookingApplicationMutation();
	const [{ data: hostingData }] = useHostingQuery({
		variables: { hostingId: String(id) },
	});

	const duration = React.useMemo(() => {
		let label = "Years";
		switch (hostingData?.hosting.paymentInterval) {
			case PaymentInterval.Weekly:
				label = "Weeks";
			case PaymentInterval.Nightly:
				label = "Nigths";
			case PaymentInterval.Monthly:
				label = "Months";
			default:
				label = "Years";
		}

		return label;
	}, [hostingData]);

	React.useEffect(() => {
		initiateApplication({
			hostingId: String(id),
		});
	}, [id, initiateApplication]);

	React.useEffect(() => {
		if (initiateData?.initiateBookingApplication.data) {
			const { createdAt, lastUpdated, status, statusDetails, ...cleanedUp } =
				removeTypenames(initiateData.initiateBookingApplication.data);
			setInput({
				...cleanedUp,
				intervalMultiplier: input.intervalMultiplier ?? 1,
			});
		}
	}, [initiateData]);

	React.useEffect(() => {
		if (error) {
			handleError(error);
		}
		if (initiateError) {
			handleError(initiateError);
		}
	}, [error, initiateError]);

	const handleMutate = () => {
		mutate({ input }).then((res) => {
			if (res.data?.updateBookingApplication) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.updateBookingApplication.message,
				});
				router.push(`/hostings/${hostingData?.hosting.id}/reservation/step-2`);
			}
		});
	};

	return (
		<>
			<DetailsLayout
				title="Booking Application"
				refreshControl={
					<RefreshControl
						refreshing={initiatingApplicaiton}
						onRefresh={() => initiateApplication({ hostingId: String(id) })}
					/>
				}
				footer={
					<View
						className="px-6 pb-4 gap-4"
						style={{ backgroundColor: colors.background }}
					>
						<Button
							onPress={handleMutate}
							type="primary"
							disabled={
								!input.intervalMultiplier ||
								!input.fullName ||
								!input.email ||
								!input.phoneNumber ||
								!input.checkInDate ||
								!input.correspondenceAddress
							}
						>
							<ThemedText content="primary">Continue</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-2">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{
							"  You're one step closer to moving in! Fill out the details below to secure this property. We’ll notify you the moment the landlord reviews your request."
						}
					</ThemedText>
					<View className="mt-8 gap-4 min-h-[500px]">
						<View
							className="flex-row items-center border justify-between p-3 px-6 rounded-2xl"
							style={{
								backgroundColor: hexToRgba(colors.text, 0.06),
								borderColor: hexToRgba(colors.text, 0.2),
							}}
						>
							<ThemedText style={{ fontSize: 18 }}>{duration}</ThemedText>
							<View className="flex-row items-center gap-6">
								<Pressable
									className="p-2"
									disabled={(input.intervalMultiplier ?? 1) <= 1}
									onPress={() =>
										updateInput({
											intervalMultiplier: (input.intervalMultiplier ?? 1) - 1,
										})
									}
								>
									<ChevronLeftIcon color={colors.text} />
								</Pressable>
								<ThemedText type="semibold">
									{input.intervalMultiplier}
								</ThemedText>
								<Pressable
									className="p-2"
									onPress={() =>
										updateInput({
											intervalMultiplier: (input.intervalMultiplier ?? 1) + 1,
										})
									}
								>
									<ChevronRightIcon color={colors.text} />
								</Pressable>
							</View>
						</View>
						<FloatingLabelInput
							focused
							label="Full Name"
							placeholder="Thomas Shelby"
							autoComplete="name"
							value={cast(input.fullName)}
							onChangeText={(v) => updateInput({ fullName: v })}
						/>
						<FloatingLabelInput
							focused
							label="Email"
							keyboardType="email-address"
							placeholder="thomashhelby@email.com"
							autoComplete="email"
							value={cast(input.email)}
							onChangeText={(v) => updateInput({ email: v })}
						/>
						<PhoneNumberSelectInput
							defaultValue={cast(input.phoneNumber)}
							onSelect={(v) => {
								updateInput({ phoneNumber: v.label });
							}}
						/>
						<View>
							<DateInput
								value={
									input.checkInDate
										? new Date(input.checkInDate).toISOString().split("T")[0]
										: ""
								}
								onChangeText={(v) => updateInput({ checkInDate: v })}
								focused
								label="Check In"
								placeholder="01/01/2025"
							/>
						</View>
						<FloatingLabelInput
							focused
							numberOfLines={5}
							containerStyle={{
								minHeight: 80,
								borderColor: hexToRgba(colors.text, 0.1),
								backgroundColor: hexToRgba(colors.text, 0.05),
							}}
							label="Correspondence Address"
							description="Your current physical address where you receive mail. This is required for your official tenancy background check and agreement."
							placeholder="Arley Hall & Gardens, Northwich, Cheshire"
							autoComplete="address-line1"
							value={cast(input.correspondenceAddress)}
							onChangeText={(v) => updateInput({ correspondenceAddress: v })}
						/>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal
				visible={initiatingApplicaiton || updatingBookingApplication}
			/>
		</>
	);
}
