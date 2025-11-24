import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import { StreamlineUltimateReceipt } from "@/components/icons/i-receipt";
import DetailsLayout from "@/components/layouts/details";
import HostingSummaryCard from "@/components/molecules/m-hosting-summary-card";
import OtpVerification from "@/components/molecules/m-otp-verification";
import PinVerification from "@/components/molecules/m-pin-verifcation";
import SuccessModal from "@/components/organisms/o-success-modal";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	PaymentInterval,
	useAuthorizeTransactionWithOtpMutation,
	useAuthorizeTransactionWithPinMutation,
	useHostingQuery,
	useInitiateBookingMutation,
	useVerifyBookingPaymentMutation,
} from "@/lib/services/graphql/generated";
import { useReservationStore } from "@/lib/stores/reservation";
import { useUserStore } from "@/lib/stores/users";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function ReservationSummary() {
	const router = useRouter();
	const colors = useThemeColors();
	const [pinOpen, setPinOpen] = React.useState(false);
	const [otpOpen, setOtpOpen] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const { id } = useLocalSearchParams();
	const { input } = useReservationStore();
	const user = useUserStore((c) => c.user);
	const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });
	const [{ fetching, data: bookingData }, mutate] =
		useInitiateBookingMutation();
	const [{ fetching: authorizingWithPin }, authorizeWithPin] =
		useAuthorizeTransactionWithPinMutation();
	const [{ fetching: authorizaingWithOtp }, authorizeWithOtp] =
		useAuthorizeTransactionWithOtpMutation();
	const [{ fetching: verifyingBookingPayment }, verifyBookingPayment] =
		useVerifyBookingPaymentMutation();

	const authorizing =
		authorizingWithPin || authorizaingWithOtp || verifyingBookingPayment;
	const hosting = data?.hosting;

	React.useEffect(() => {
		mutate({
			input: { ...input, phoneNumber: input.phoneNumber.slice(1) },
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
		});
	}, []);

	const handleAuthorizeWithOtp = (otp: string) => {
		authorizeWithOtp({
			input: {
				transactionId: bookingData?.initiateBooking.data?.transaction?.id ?? "",
				otp,
			},
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.authorizeTransactionWithOtp.message,
				});
				setOtpOpen(false);
				verifyBookingPayment({
					verifyBookingPaymentId: bookingData?.initiateBooking.data?.id ?? "",
				}).then((res) => {
					if (res.error) {
						handleError(res.error);
					}
					if (res.data) {
						Toast.show({
							type: "success",
							text1: "Success",
							text2: res.data.verifyBookingPayment.message,
						});
						setSuccess(true);
					}
				});
			}
		});
	};

	const handleAuthorizeWithPin = (pin: string) => {
		authorizeWithPin({
			input: {
				transactionId: bookingData?.initiateBooking.data?.transaction?.id ?? "",
				pin,
			},
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.authorizeTransactionWithPin.message,
				});
				setPinOpen(false);
				setOtpOpen(true);
			}
		});
	};

	return (
		<>
			<DetailsLayout title="Reservation Summary">
				<View className="flex-1 gap-4 justify-between">
					<View className="mt-2 gap-8">
						<View className="gap-8">
							<ThemedText
								style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
							>
								<CircleQuestionMark
									color={hexToRgba(colors.text, 0.7)}
									size={12}
								/>
								{"  "}
								Review your Reservation Summary below. When ready, tap Continue
								to verify your identity and complete the payment securely.
							</ThemedText>
							<View
								className="border-b pb-8"
								style={{ borderColor: hexToRgba(colors.text, 0.1) }}
							>
								{hosting && <HostingSummaryCard hosting={hosting} />}
							</View>
						</View>
						<View
							className="p-4 px-6 border rounded-xl gap-3"
							style={{ borderColor: hexToRgba(colors.text, 0.15) }}
						>
							<View className="flex-row items-center justify-between">
								<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
									Date
								</ThemedText>
								<ThemedText>
									{new Date(input.checkInDate ?? "").toLocaleDateString()} -{" "}
									{new Date(input.checkOutDate ?? "").toLocaleDateString()}
								</ThemedText>
							</View>
							<View className="flex-row items-center justify-between">
								<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
									Duration
								</ThemedText>
								<ThemedText>
									1{" "}
									{hosting?.paymentInterval === PaymentInterval.Weekly
										? "Week"
										: PaymentInterval.Anually
											? "Year"
											: PaymentInterval.Monthly
												? "Month"
												: "Night"}
								</ThemedText>
							</View>
						</View>
						<View
							className="p-4 px-6 border rounded-xl gap-3"
							style={{ borderColor: hexToRgba(colors.text, 0.15) }}
						>
							<View className="flex-row items-center justify-between">
								<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
									Amount
								</ThemedText>
								<ThemedText>
									₦{Number(hosting?.price).toLocaleString()}
								</ThemedText>
							</View>
							<View
								className="flex-row pb-4 border-b items-center justify-between"
								style={{ borderColor: hexToRgba(colors.text, 0.1) }}
							>
								<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
									Service Fee
								</ThemedText>
								<ThemedText>
									₦
									{Number(
										bookingData?.initiateBooking.data?.guestServiceCharge ??
											"0",
									)?.toLocaleString()}
								</ThemedText>
							</View>
							<View className="flex-row pb-2 items-center justify-between">
								<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
									Total
								</ThemedText>
								<ThemedText
									style={{
										fontFamily: Fonts.bold,
										color: colors.primary,
										fontSize: 20,
									}}
								>
									₦
									{(
										Number(hosting?.price) +
										Number(
											bookingData?.initiateBooking.data?.guestServiceCharge ??
												"0",
										)
									).toLocaleString()}
								</ThemedText>
							</View>
						</View>
					</View>
					<Button
						disabled={fetching}
						loading={fetching}
						onPress={() => setPinOpen(true)}
						type="primary"
					>
						<ThemedText content="primary">Continue</ThemedText>
					</Button>
				</View>
				<PinVerification
					open={pinOpen}
					onCancel={() => setPinOpen(false)}
					onContinue={handleAuthorizeWithPin}
				/>
				<OtpVerification
					open={otpOpen}
					onCancel={() => setPinOpen(false)}
					onContinue={handleAuthorizeWithOtp}
				/>
				<SuccessModal
					open={success}
					onClose={() => setSuccess(false)}
					title="Payment Successful"
					description={`Your "${hosting?.title}" is booked! Access the booking ticket on your profile >> My Bookings  or view it right away.`}
					action={
						<Button
							onPress={() => router.replace(`/users/${user.user?.id}/bookings`)}
							type="primary"
							className="w-60"
						>
							<View className="flex-row gap-2 items-center">
								<StreamlineUltimateReceipt
									size={18}
									color={colors["primary-content"]}
								/>
								<ThemedText content="primary">View E-Recipet</ThemedText>
							</View>
						</Button>
					}
				/>
			</DetailsLayout>
			<LoadingModal visible={authorizing} />
		</>
	);
}
