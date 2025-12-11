import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import Skeleton from "@/components/atoms/a-skeleton";
import SummarySection from "@/components/atoms/a-summary-section";
import ThemedText from "@/components/atoms/a-themed-text";
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
import LeaveAReviewButton from "@/components/organisms/o-leave-a-review-button";
import HostingReviewCard from "@/components/molecules/m-hosting-review-card";
import ReviewItem from "@/components/molecules/m-review-item";
import { REVIEW_METRICS } from "@/lib/constants/reviews";
import { useDownlods } from "@/lib/hooks/downloads";
import { openLocalFile } from "@/lib/utils/file";

export default function UserBooking() {
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const { download, getLocalUri } = useDownlods();
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
				let localUri = getLocalUri(booking.tenancyAgreementAsset!.publicUrl);
				if (!localUri) {
					localUri = await download(
						booking.tenancyAgreementAsset!.publicUrl,
						`tenancy-${booking.id}.pdf`,
					);
				}
				setLocalPdfUri(localUri);
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

	const openTenancyAgreement = async () => {
		if (!booking?.tenancyAgreementAsset?.publicUrl) return;
		const localUri = getLocalUri(booking?.tenancyAgreementAsset?.publicUrl);
		if (!localUri) {
			return;
		}
		openLocalFile(localUri);
	};

	return (
		<>
			<DetailsLayout title={booking?.hosting.title ?? "My Booking"}>
				<View className="mt-4 gap-4">
					<SummarySection>
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
					<SummarySection>
						<ItemSummary label="Title" summary={booking?.hosting.title ?? ""} />
						<ItemSummary
							label="Property Type"
							summary={booking?.hosting.propertyType ?? ""}
						/>
						<ItemSummary
							label="Address"
							summary={`${booking?.hosting.landmarks ?? ""} ${booking?.hosting.street}, ${booking?.hosting.city}, ${booking?.hosting.state}`}
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
				{booking?.userReview ? (
					<View>
						<View className="flex-row items-center justify-between">
							<ThemedText>Your Review</ThemedText>
							<LeaveAReviewButton
								edit
								review={booking.userReview}
								hostingId={booking?.hosting.id}
							/>
						</View>
						<View
							className="mt-4 gap-3 p-4 rounded-xl"
							style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
						>
							<ReviewItem
								value={booking.userReview.cleanliness ?? 0.0}
								title={REVIEW_METRICS.cleanliness.label}
								description={REVIEW_METRICS.cleanliness.desc}
							/>
							<ReviewItem
								value={booking.userReview.accuracy ?? 0.0}
								title={REVIEW_METRICS.accuracy.label}
								description={REVIEW_METRICS.accuracy.desc}
							/>
							<ReviewItem
								value={booking.userReview.communication ?? 0.0}
								title={REVIEW_METRICS.communication.label}
								description={REVIEW_METRICS.communication.desc}
							/>
							<ReviewItem
								value={booking.userReview.location ?? 0.0}
								title={REVIEW_METRICS.location.label}
								description={REVIEW_METRICS.location.desc}
							/>
							<ReviewItem
								value={booking.userReview.checkIn ?? 0.0}
								title={REVIEW_METRICS.checkIn.label}
								description={REVIEW_METRICS.checkIn.desc}
							/>
							<ReviewItem
								value={booking.userReview.value ?? 0.0}
								title={REVIEW_METRICS.value.label}
								description={REVIEW_METRICS.value.desc}
							/>
						</View>
						<HostingReviewCard review={booking.userReview} />
					</View>
				) : (
					<LeaveAReviewButton hostingId={booking?.hosting.id} />
				)}
				<View>
					{booking?.status !== BookingStatus.Completed &&
						booking?.status !== BookingStatus.Canceled &&
						booking?.paymentStatus === PaymentStatus.Paid && (
							<View className="gap-4">
								<ThemedText
									style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
								>
									<CircleQuestionMark
										color={hexToRgba(colors.text, 0.7)}
										size={12}
									/>
									{"  "}
									Note if left uncanceled bookings will be automatically
									finalized within 2 weeks of initial payment.
								</ThemedText>
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
							</View>
						)}
				</View>
				{!localPdfUri ? (
					<Skeleton style={{ height: 700, borderRadius: 20, marginTop: 16 }} />
				) : (
					<View className="mt-4 relative">
						<Pdf
							scrollEnabled={false}
							enablePaging
							singlePage
							source={{
								uri: localPdfUri,
								cache: false,
							}}
							style={{
								height: 640,
								borderColor: hexToRgba(colors.text, 0.4),
								borderWidth: 1,
								borderRadius: 20,
							}}
						/>
						<Button
							onPress={openTenancyAgreement}
							variant="outline"
							type="tinted"
							className="absolute top-2 right-2"
						>
							<View className="flex-row items-center gap-2">
								<Download color={hexToRgba(colors.primary, 0.6)} size={18} />
								<ThemedText content="tinted">Open</ThemedText>
							</View>
						</Button>
					</View>
				)}
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
