import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import Skeleton from "@/components/atoms/a-skeleton";
import SummarySection from "@/components/atoms/a-summary-section";
import ThemedText from "@/components/atoms/a-themed-text";
import * as FileSystem from "expo-file-system/legacy";
import DetailsLayout from "@/components/layouts/details";
import { BookingDetails } from "@/components/molecules/m-booking-details";
import ItemSummary from "@/components/molecules/m-item-summary";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	BookingStatus,
	PaymentStatus,
	useBookingQuery,
	useFinalizeBookingMutation,
	useVerifyBookingPaymentMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { capitalize } from "@/lib/utils/text";
import { useLocalSearchParams } from "expo-router";
import { CircleQuestionMark, Download } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import Pdf from "react-native-pdf";

export default function UserBooking() {
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [pdfHeight, setPdfHeight] = React.useState(700);
	const [{ data, fetching: fetchingBooking }] = useBookingQuery({
		variables: { bookingId: cast(id) },
	});
	const [{ fetching: finalizing }, finanlizeBooking] =
		useFinalizeBookingMutation();
	const [{ fetching: verifyingBookingPayment }, verifyBookingPayment] =
		useVerifyBookingPaymentMutation();
	const [localPdfUri, setLocalPdfUri] = React.useState<string | null>(null);

	const booking = data?.booking;
	const loading = finalizing || fetchingBooking || verifyingBookingPayment;

	React.useEffect(() => {
		if (!booking?.tenancyAgreementAsset?.publicUrl) return;

		(async () => {
			try {
				const encodedUrl = encodeURI(booking.tenancyAgreementAsset!.publicUrl);

				const localPath =
					FileSystem.cacheDirectory + `tenancy-${booking.id}.pdf`;

				const result = await FileSystem.downloadAsync(encodedUrl, localPath);

				console.log("PDF saved to:", result.uri);
				setLocalPdfUri(result.uri); // ✅ THIS IS IMPORTANT
			} catch (err) {
				console.error("PDF preload failed:", err);
			}
		})();
	}, [booking?.tenancyAgreementAsset?.publicUrl]);

	React.useEffect(() => {
		if (booking?.paymentStatus === PaymentStatus.Pending) {
			verifyBookingPayment({ verifyBookingPaymentId: booking.id });
		}
	}, [booking]);

	const handleFinailze = () => {
		finanlizeBooking({ bookingId: cast(id) }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: "Booking finalized successfully",
				});
			}
		});
	};

	const handleDownloadTenancyAgreement = async () => {
		if (!booking?.tenancyAgreementAsset?.publicUrl) return;
		const fileUri = `${FileSystem.documentDirectory}pdfs/tenancy-agreement-${booking.id}.pdf`;

		try {
			await FileSystem.makeDirectoryAsync(
				`${FileSystem.documentDirectory}pdfs`,
				{
					intermediates: true,
				},
			);

			const result = await FileSystem.downloadAsync(
				booking.tenancyAgreementAsset.publicUrl,
				fileUri,
			);

			Toast.show({
				type: "success",
				text1: "Tenancy agreement downloaded",
			});

			console.log("Downloaded to:", result.uri);
		} catch (error) {
			console.error(error);
		}
	};

	console.log(booking?.tenancyAgreementAsset?.publicUrl);

	return (
		<>
			<DetailsLayout title={booking?.hosting.title ?? "My Booking"}>
				<View className="mt-4">
					<SummarySection>
						<ItemSummary
							label="Hosting"
							summary={booking?.hosting.title ?? ""}
						/>
						<ItemSummary label="Full Name" summary={booking?.fullName ?? ""} />
						<ItemSummary label="Email" summary={booking?.email ?? ""} />
						<ItemSummary
							label="Phone Number"
							summary={booking?.phoneNumber ?? ""}
						/>
						<ItemSummary
							label="Payment Method"
							summary={capitalize(booking?.paymentMethod ?? "")}
						/>
						<ItemSummary
							label="Payment Status"
							summary={capitalize(booking?.paymentStatus ?? "")}
						/>
					</SummarySection>
				</View>
				<View className="gap-6 mt-8">
					{!booking ? (
						<Skeleton style={{ height: 500, borderRadius: 20 }} />
					) : (
						<BookingDetails showUserInfo={false} booking={booking} />
					)}
				</View>
				<View className="gap-4">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Note if left uncanceled bookings will be automatically finalized
						within 2 weeks of initial payment.
					</ThemedText>
					{booking?.status !== BookingStatus.Completed &&
						booking?.status !== BookingStatus.Canceled &&
						booking?.paymentStatus === PaymentStatus.Paid && (
							<View className="flex-row gap-4">
								<Button
									className="flex-1"
									style={{ backgroundColor: hexToRgba(colors.error, 0.6) }}
								>
									<ThemedText content="error">Cancel</ThemedText>
								</Button>
								<Button
									onPress={handleFinailze}
									className="flex-1"
									style={{ backgroundColor: hexToRgba(colors.primary, 0.6) }}
								>
									<ThemedText content="primary">Finalize</ThemedText>
								</Button>
							</View>
						)}
				</View>
				{!localPdfUri ? (
					<Skeleton style={{ height: 700, borderRadius: 20, marginTop: 16 }} />
				) : (
					<View className="mt-4 relative">
						<Pdf
							scrollEnabled={false}
							source={{
								uri: localPdfUri,
								cache: false,
							}}
							onLoadComplete={(numberOfPages) => {
								const calculatedHeight = Math.min(numberOfPages * 700, 3500);
								setPdfHeight(calculatedHeight);
							}}
							style={{
								height: pdfHeight,
								borderColor: colors.text,
								borderWidth: 1,
								borderRadius: 20,
							}}
						/>
						<Button
							onPress={handleDownloadTenancyAgreement}
							variant="outline"
							type="tinted"
							className="absolute top-2 right-2"
						>
							<View className="flex-row items-center gap-2">
								<Download color={hexToRgba(colors.primary, 0.6)} size={18} />
								<ThemedText content="tinted">Download</ThemedText>
							</View>
						</Button>
					</View>
				)}
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
