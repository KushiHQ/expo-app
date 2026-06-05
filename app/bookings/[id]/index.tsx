import Button from "@/components/atoms/a-button";
import DataRow from "@/components/atoms/a-data-row";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ErrorModal from "@/components/organisms/o-error-modal";
import PINModal from "@/components/organisms/o-pin-modal";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import BookingDetailsSheet from "@/components/molecules/m-booking-details";
import ConfirmationSheet from "@/components/molecules/m-confirmation-sheet";
import HostingReviewCard from "@/components/molecules/m-hosting-review-card";
import ReviewItem from "@/components/molecules/m-review-item";
import ReviewSection from "@/components/molecules/m-review-section";
import LeaveAReviewButton from "@/components/organisms/o-leave-a-review-button";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { REVIEW_METRICS } from "@/lib/constants/reviews";
import { Fonts } from "@/lib/constants/theme";
import { useDownlods } from "@/lib/hooks/downloads";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import {
  BookingStatus,
  TransactionStatus,
  useBookingQuery,
  useCancelBookingMutation,
  useFinalizeBookingMutation,
  useInitiateCancelBookingMutation,
  useInitiateFinalizeBookingMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { formatNaira } from "@/lib/utils/currency";
import { handleError } from "@/lib/utils/error";
import { openLocalFile } from "@/lib/utils/file";
import { calculateBookingDuration } from "@/lib/utils/time";
import { toTitleCase } from "@/lib/utils/text";
import { toast } from "@/lib/hooks/use-toast";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Building2,
  CalendarDays,
  CircleQuestionMark,
  CreditCard,
  Download,
  FileText,
  MapPin,
  Receipt,
  ShieldCheck,
  Star,
  User,
} from "lucide-react-native";
import React from "react";
import { Pressable, View, Modal } from "react-native";
import BookingFeedbackPrompt from "@/components/molecules/m-booking-feedback-prompt";
import Pdf from "react-native-pdf";

const BOOKING_STATUS_COLORS: Record<string, string> = {
  [BookingStatus.Paid]: "#10B981",
  [BookingStatus.Completed]: "#3B82F6",
  [BookingStatus.Canceled]: "#94A3B8",
};

export default function UserBooking() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { download, getLocalUri } = useDownlods();
  const [{ data, fetching: fetchingBooking }] = useBookingQuery({
    variables: { bookingId: cast(id) },
  });
  const [{ fetching: initiatingFinalize }, initiateFinalize] =
    useInitiateFinalizeBookingMutation();
  const [{ fetching: finalizing }, finanlizeBooking] =
    useFinalizeBookingMutation();
  const [{ fetching: initiatingCancel }, initiateCancel] =
    useInitiateCancelBookingMutation();
  const [{ fetching: canceling }, cancelBooking] = useCancelBookingMutation();
  const [localPdfUri, setLocalPdfUri] = React.useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelOtpOpen, setCancelOtpOpen] = React.useState(false);
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [finalizeOtpOpen, setFinalizeOtpOpen] = React.useState(false);
  const user = useUser();
  const booking = data?.booking;
  const isGuest = booking?.guest?.user?.id != null && user.user?.user?.id != null && booking.guest.user.id === user.user.user.id;
  const [showFeedbackPrompt, setShowFeedbackPrompt] = React.useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  // Check if booking is completed and show feedback prompt
  React.useEffect(() => {
    if (booking?.status === BookingStatus.Completed && !feedbackSubmitted) {
      setShowFeedbackPrompt(true);
    }
  }, [booking?.status, feedbackSubmitted]);
  const loading =
    initiatingFinalize || finalizing || initiatingCancel || canceling;

  const coverUrl = booking?.hosting?.coverImage?.asset?.publicUrl;
  const location = [booking?.hosting?.city, booking?.hosting?.state]
    .filter(Boolean)
    .join(", ");
  const statusColor = booking?.status
    ? (BOOKING_STATUS_COLORS[booking.status] ?? hexToRgba(colors.text, 0.4))
    : hexToRgba(colors.text, 0.4);

  const isPaymentPending =
    (booking?.transaction?.status === TransactionStatus.Pending ||
      booking?.transaction?.status === TransactionStatus.Failed) &&
    !!booking.transaction.reference;

  const canFinalize =
    booking?.status !== BookingStatus.Completed &&
    booking?.status !== BookingStatus.Canceled &&
    booking?.transaction?.status === TransactionStatus.Success;

  const total =
    Number(booking?.amount ?? 0) + Number(booking?.guestServiceCharge ?? 0);

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
  }, [
    booking?.tenancyAgreementAsset?.publicUrl,
    getLocalUri,
    download,
    booking?.id,
    booking?.tenancyAgreementAsset,
  ]);

  const handleInitiateCancel = () => {
    initiateCancel({ bookingId: cast(id) }).then((res) => {
      if (res.error) {
        handleError(res.error);
      } else if (res.data) {
        setCancelOpen(false);
        setCancelOtpOpen(true);
      }
    });
  };

  const handleCancel = (otp: string) => {
    cancelBooking({ bookingId: cast(id), otp }).then((res) => {
      if (res.error) {
        setCancelOtpOpen(false);
        setCancelError(
          res.error.message ?? "Something went wrong. Please try again.",
        );
      } else if (res.data) {
        setCancelOtpOpen(false);
        toast.show({
          type: "success",
          text1: "Booking Cancelled",
          text2: res.data.cancelBooking.message,
        });
      }
    });
  };

  const handleInitiateFinalize = () => {
    initiateFinalize({ bookingId: cast(id) }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      setFinalizeOtpOpen(true);
    });
  };

  const handleFinalize = (otp: string) => {
    finanlizeBooking({ bookingId: cast(id), otp }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      setFinalizeOtpOpen(false);
      toast.show({
        type: "success",
        text1: "Booking Finalized",
        text2: "Your Tenancy Agreement has been sent to your email.",
      });
    });
  };

  const handleCompletePayment = () => {
    if (!booking?.transaction?.reference) return;
    router.push({
      pathname: "/hostings/[id]/reservation/checkout",
      params: {
        id: booking.hosting.id,
        bkId: booking.id,
        ref: booking.transaction.reference,
      },
    });
  };

  const openTenancyAgreement = async () => {
    if (!booking?.tenancyAgreementAsset?.publicUrl) return;
    const localUri = getLocalUri(booking?.tenancyAgreementAsset?.publicUrl);
    if (!localUri) return;
    openLocalFile(localUri);
  };

  const footer = isGuest && (isPaymentPending ? (
    <View
      className="flex-row gap-4 p-4 pb-8"
      style={{ backgroundColor: colors.background }}
    >
      <Button
        onPress={handleCompletePayment}
        type="primary"
        className="flex-1"
        style={{ backgroundColor: colors.accent }}
      >
        <ThemedText style={{ color: "white", fontWeight: "600" }}>
          Complete Payment
        </ThemedText>
      </Button>
    </View>
  ) : isGuest && canFinalize ? (
    <View
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 12,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
        <CircleQuestionMark
          color={hexToRgba(colors.text, 0.4)}
          size={12}
          style={{ marginTop: 2 }}
        />
        <ThemedText
          style={{ fontSize: 12, color: hexToRgba(colors.text, 0.5), flex: 1 }}
        >
          Bookings will be automatically finalized within 2 weeks of payment.
        </ThemedText>
      </View>
      <View className="flex-row gap-4">
        <Button
          className="flex-1"
          variant="outline"
          type="error"
          style={{ borderColor: hexToRgba(colors.error, 0.6) }}
          onPress={() => setCancelOpen(true)}
        >
          <ThemedText style={{ color: hexToRgba(colors.error, 0.9) }}>
            Cancel
          </ThemedText>
        </Button>
        <Button
          onPress={handleInitiateFinalize}
          type="primary"
          className="flex-1"
        >
          <ThemedText content="primary">Finalize</ThemedText>
        </Button>
      </View>
    </View>
  ) : undefined);

  return (
    <>
      <DetailsLayout
        title={booking?.hosting?.title ?? "My Booking"}
        footer={footer}
        withSupport={true}
      >
        {fetchingBooking && !booking ? (
          <View style={{ gap: 14, paddingTop: 8 }}>
            <Skeleton style={{ height: 160, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
          </View>
        ) : (
          <View style={{ gap: 14, paddingBottom: 8 }}>
            {/* Property */}
            <ReviewSection
              borderless
              icon={<Building2 size={15} color={colors.primary} />}
              title="Property"
            >
              <View style={{ gap: 10 }}>
                <Pressable
                  onPress={() =>
                    router.push(`/hostings/${booking?.hosting.id}`)
                  }
                >
                  <Image
                    source={coverUrl ? { uri: coverUrl } : FALLBACK_IMAGE}
                    placeholder={{ blurhash: PROPERTY_BLURHASH }}
                    contentFit="cover"
                    style={{ width: "100%", height: 140, borderRadius: 10 }}
                  />
                </Pressable>
                <View style={{ gap: 4 }}>
                  <ThemedText
                    style={{ fontSize: 14, fontFamily: Fonts.semibold }}
                  >
                    {booking?.hosting?.title ?? "—"}
                  </ThemedText>
                  {location ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <MapPin size={12} color={hexToRgba(colors.text, 0.4)} />
                      <ThemedText
                        style={{
                          fontSize: 12,
                          color: hexToRgba(colors.text, 0.4),
                        }}
                      >
                        {location}
                      </ThemedText>
                    </View>
                  ) : null}
                  {booking?.hosting?.propertyType ? (
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: hexToRgba(colors.text, 0.35),
                      }}
                    >
                      {toTitleCase(booking.hosting.propertyType)}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            </ReviewSection>

            {/* Booking Status */}
            <ReviewSection
              icon={<ShieldCheck size={15} color={colors.primary} />}
              title="Booking Status"
            >
              {booking?.status && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: hexToRgba(colors.text, 0.4),
                      width: 112,
                      flexShrink: 0,
                    }}
                  >
                    Status
                  </ThemedText>
                  <View
                    style={{
                      backgroundColor: hexToRgba(statusColor, 0.15),
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: hexToRgba(statusColor, 0.3),
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: statusColor,
                        fontFamily: Fonts.semibold,
                      }}
                    >
                      {toTitleCase(booking.status.replaceAll("_", " "))}
                    </ThemedText>
                  </View>
                </View>
              )}
              <DataRow label="Ref #" value={booking?.bookingReference ?? "—"} />
              <DataRow
                label="Booked"
                value={
                  booking?.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    : "—"
                }
              />
              {isPaymentPending && (
                <View
                  style={{
                    backgroundColor: hexToRgba("#F59E0B", 0.08),
                    borderRadius: 10,
                    padding: 12,
                    gap: 4,
                    borderWidth: 1,
                    borderColor: hexToRgba("#F59E0B", 0.25),
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 13,
                      fontFamily: Fonts.semibold,
                      color: "#F59E0B",
                    }}
                  >
                    Payment Pending
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
                  >
                    Your application was approved. Complete payment to secure
                    the property.
                  </ThemedText>
                </View>
              )}
            </ReviewSection>

            {/* Lease Terms */}
            {booking?.commencementDate && (
              <ReviewSection
                icon={<CalendarDays size={15} color={colors.primary} />}
                title="Lease Terms"
              >
                <DataRow
                  label="Commencement"
                  value={new Date(booking.commencementDate).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                  accent
                />
                {booking.expiryDate && (
                  <DataRow
                    label="Expiry"
                    value={new Date(booking.expiryDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  />
                )}
                {booking.expiryDate && (
                  <DataRow
                    label="Duration"
                    value={calculateBookingDuration(
                      booking.commencementDate,
                      booking.expiryDate,
                    )}
                  />
                )}
                {booking.hosting?.paymentInterval && (
                  <DataRow
                    label="Interval"
                    value={toTitleCase(booking.hosting.paymentInterval)}
                  />
                )}
                {booking.bookingApplication?.intervalMultiplier != null && (
                  <DataRow
                    label="Periods"
                    value={`${booking.bookingApplication.intervalMultiplier} payment period(s)`}
                  />
                )}
              </ReviewSection>
            )}

            {/* Personal Information */}
            <ReviewSection
              icon={<User size={15} color={colors.primary} />}
              title="Personal Information"
            >
              <DataRow label="Full Name" value={booking?.fullName ?? "—"} />
              <DataRow label="Email" value={booking?.email ?? "—"} />
              <DataRow label="Phone" value={booking?.phoneNumber ?? "—"} />
            </ReviewSection>

            {/* Payment Summary */}
            <ReviewSection
              icon={<CreditCard size={15} color={colors.primary} />}
              title="Payment Summary"
            >
              {booking?.feeLineItems?.map((item) => (
                <DataRow
                  key={item.key}
                  label={item.label}
                  value={formatNaira(item.amount).formated}
                />
              ))}
              <View
                style={{
                  height: 1,
                  backgroundColor: hexToRgba(colors.text, 0.07),
                  marginVertical: 2,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ThemedText
                  style={{ fontSize: 13, color: hexToRgba(colors.text, 0.5) }}
                >
                  Total
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 18,
                    fontFamily: Fonts.bold,
                    color: colors.primary,
                  }}
                >
                  ₦{total.toLocaleString()}
                </ThemedText>
              </View>
              {isGuest && (
                <Button
                  variant="text"
                  type="primary"
                  className="mt-2"
                  style={{ paddingVertical: 11 }}
                  onPress={() => setReceiptOpen(true)}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
                  >
                    <Receipt size={15} color={colors.primary} />
                    <ThemedText
                      style={{
                        color: colors.primary,
                        fontFamily: Fonts.semibold,
                        fontSize: 13.5,
                        letterSpacing: 0.2,
                      }}
                    >
                      View Receipt
                    </ThemedText>
                  </View>
                </Button>
              )}
            </ReviewSection>

            {/* Review */}
            {isGuest && (
              <>
                {booking?.userReview ? (
                  <ReviewSection
                    icon={<Star size={15} color={colors.primary} />}
                    title="Your Review"
                  >
                    <ReviewItem
                      value={booking.userReview.cleanliness ?? 0}
                      title={REVIEW_METRICS.cleanliness.label}
                      description={REVIEW_METRICS.cleanliness.desc}
                    />
                    <ReviewItem
                      value={booking.userReview.accuracy ?? 0}
                      title={REVIEW_METRICS.accuracy.label}
                      description={REVIEW_METRICS.accuracy.desc}
                    />
                    <ReviewItem
                      value={booking.userReview.communication ?? 0}
                      title={REVIEW_METRICS.communication.label}
                      description={REVIEW_METRICS.communication.desc}
                    />
                    <ReviewItem
                      value={booking.userReview.location ?? 0}
                      title={REVIEW_METRICS.location.label}
                      description={REVIEW_METRICS.location.desc}
                    />
                    <ReviewItem
                      value={booking.userReview.checkIn ?? 0}
                      title={REVIEW_METRICS.checkIn.label}
                      description={REVIEW_METRICS.checkIn.desc}
                    />
                    <ReviewItem
                      value={booking.userReview.value ?? 0}
                      title={REVIEW_METRICS.value.label}
                      description={REVIEW_METRICS.value.desc}
                    />
                    <HostingReviewCard review={booking.userReview} />
                    <LeaveAReviewButton
                      edit
                      review={booking.userReview}
                      hostingId={booking.hosting.id}
                    />
                  </ReviewSection>
                ) : (
                  <LeaveAReviewButton hostingId={booking?.hosting.id} />
                )}
              </>
            )}

            {isGuest && booking?.status === BookingStatus.Completed && (
              <ReviewSection
                icon={<FileText size={15} color={colors.primary} />}
                title="Tenancy Agreement"
              >
                {!localPdfUri ? (
                  <Skeleton style={{ height: 640, borderRadius: 12 }} />
                ) : (
                  <View style={{ position: "relative" }}>
                    <Pdf
                      scrollEnabled={false}
                      enablePaging
                      singlePage
                      source={{ uri: localPdfUri, cache: false }}
                      style={{
                        height: 640,
                        width: "100%",
                        borderColor: hexToRgba(colors.text, 0.15),
                        borderWidth: 1,
                        borderRadius: 12,
                      }}
                    />
                    <Button
                      onPress={openTenancyAgreement}
                      variant="outline"
                      type="primary"
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        borderColor: hexToRgba(colors.primary, 0.3),
                        backgroundColor: hexToRgba(colors.surface, 0.92),
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Download color={colors.primary} size={15} />
                        <ThemedText
                          style={{
                            color: colors.primary,
                            fontFamily: Fonts.semibold,
                            fontSize: 13,
                            letterSpacing: 0.2,
                          }}
                        >
                          Open
                        </ThemedText>
                      </View>
                    </Button>
                  </View>
                )}
              </ReviewSection>
            )}
          </View>
        )}
      </DetailsLayout>

      {booking && (
        <BookingDetailsSheet
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          booking={booking as any}
        />
      )}
      <ConfirmationSheet
        prompt="Cancel Booking"
        description="Are you sure you want to cancel this booking?"
        confirmPrompt="Yes, Cancel"
        confirmMode="error"
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleInitiateCancel}
      />
      <PINModal
        label="Enter OTP"
        description={`A cancellation confirmation code has been sent to ${user.user?.email ?? 'your email'}`}
        length={6}
        onSubmit={handleCancel}
        open={cancelOtpOpen}
        onClose={() => setCancelOtpOpen(false)}
      />
      <PINModal
        label="Enter OTP"
        description={`A finalization confirmation code has been sent to ${user.user?.email ?? 'your email'}`}
        length={6}
        onSubmit={handleFinalize}
        open={finalizeOtpOpen}
        onClose={() => setFinalizeOtpOpen(false)}
      />
      <ErrorModal
        open={!!cancelError}
        onClose={() => setCancelError(null)}
        title="Cancellation Failed"
        description={cancelError ?? undefined}
      />
      <LoadingModal visible={loading} />

      {/* Booking Feedback Prompt Modal */}
      <Modal
        visible={showFeedbackPrompt && !feedbackSubmitted}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedbackPrompt(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: hexToRgba(colors.background, 0.8),
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <BookingFeedbackPrompt
            bookingId={cast(id)}
            onDismiss={() => setShowFeedbackPrompt(false)}
            onSubmit={() => {
              setFeedbackSubmitted(true);
              setShowFeedbackPrompt(false);
            }}
          />
        </View>
      </Modal>
    </>
  );
}
