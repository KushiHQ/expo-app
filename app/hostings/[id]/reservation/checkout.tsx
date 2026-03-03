import { PayWithFlutterwave } from "flutterwave-react-native";
import { View } from "react-native";
import { useUser } from "@/lib/hooks/user";
import CheckoutSummaryScreen from "@/components/screens/checkout-summary";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	TransactionStatus,
	useBookingQuery,
	useTransactionByReferenceQuery,
	useVerifyTransactionByReferenceMutation,
} from "@/lib/services/graphql/generated";
import HostingSummaryCard from "@/components/molecules/m-hosting-summary-card";
import Skeleton from "@/components/atoms/a-skeleton";
import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import LoadingModal from "@/components/atoms/a-loading-modal";
import Toast from "react-native-toast-message";
import SuccessModal from "@/components/organisms/o-success-modal";
import React from "react";
import { StreamlineUltimateReceipt } from "@/components/icons/i-receipt";
import { handleError } from "@/lib/utils/error";

export default function ReservationCheckout() {
	const user = useUser();
	const router = useRouter();
	const colors = useThemeColors();
	const { bkId, ref } = useLocalSearchParams();
	const [{ data: bookingData }] = useBookingQuery({
		variables: {
			bookingId: String(bkId),
		},
	});
	const [success, setSuccess] = React.useState(false);
	const [{ fetching: verifying, error }, verifyPayment] =
		useVerifyTransactionByReferenceMutation();
	const [{ data: referenceData }] = useTransactionByReferenceQuery({
		variables: {
			reference: String(ref),
		},
	});

	React.useEffect(() => {
		if (error) {
			handleError(error);
		}
	}, [error]);

	function handleVerifyPayment() {
		verifyPayment({
			reference: String(ref),
		}).then((res) => {
			if (res.data?.verifyTransactionByReference) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.verifyTransactionByReference.message,
				});
				if (
					res.data.verifyTransactionByReference.data?.status ===
					TransactionStatus.Success
				) {
					setSuccess(true);
				} else {
					router.replace("/bookings");
				}
			}
		});
	}

	return (
		<>
			<CheckoutSummaryScreen
				title="Checkout"
				booking={bookingData?.booking}
				header={
					<View className="mb-6">
						{bookingData?.booking.hosting ? (
							<HostingSummaryCard hosting={bookingData?.booking.hosting} />
						) : (
							<Skeleton style={{ height: 120, borderRadius: 14 }} />
						)}
					</View>
				}
				footer={
					<View className="p-4 py-8">
						<View>
							<PayWithFlutterwave
								onRedirect={handleVerifyPayment}
								options={{
									authorization:
										process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
									amount: Number(
										referenceData?.transactionByReference.amount ?? "0",
									),
									tx_ref: String(ref),
									currency: "NGN",
									customer: {
										email: user.user.email ?? "",
										phonenumber: bookingData?.booking.phoneNumber,
										name: user.user.user?.profile.fullName,
									},
									customizations: {
										title: "Kushi Booking",
										description: `Payment for ${bookingData?.booking.hosting?.title}`,
										logo: "https://res.cloudinary.com/dev-media/image/upload/v1772369352/logo_miq5eq.png",
									},
								}}
								customButton={(props) => (
									<Button
										onPress={props.onPress}
										disabled={props.disabled}
										style={{ borderRadius: 14, backgroundColor: colors.accent }}
									>
										<ThemedText style={{ color: "white" }}>Pay Now</ThemedText>
									</Button>
								)}
							/>
						</View>
					</View>
				}
			/>
			<SuccessModal
				open={success}
				onClose={() => setSuccess(false)}
				title="Payment Successful"
				description={`Your "${bookingData?.booking.hosting.title}" is booked! Access the booking ticket on your profile >> My Bookings  or view it right away.`}
				action={
					<Button
						onPress={() => router.replace("/bookings")}
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
			<LoadingModal visible={verifying} />
		</>
	);
}
