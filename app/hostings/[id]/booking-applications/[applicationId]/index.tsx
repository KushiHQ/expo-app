import Button from '@/components/atoms/a-button';
import DataRow from '@/components/atoms/a-data-row';
import LoadingModal from '@/components/atoms/a-loading-modal';
import Skeleton from '@/components/atoms/a-skeleton';
import StackedRow from '@/components/atoms/a-stacked-row';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import ConfirmationSheet from '@/components/molecules/m-confirmation-sheet';
import ReviewSection from '@/components/molecules/m-review-section';
import PINModal from '@/components/organisms/o-pin-modal';
import {
  BOOKING_APPLICATION_INCOME_RANGES,
  BOOKING_APPLICATION_STATUS_COLORS,
} from '@/lib/constants/booking/application';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  BookingApplicationStatus,
  useAcceptBookingApplicationMutation,
  useBookingApplicationQuery,
  useHostingQuery,
  useHostUpdateBookingApplicationStatusMutation,
  useInitiateAcceptBookingApplicationMutation,
} from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { hostingDuration } from '@/lib/utils/hosting/tenancyAgreement';
import { capitalize, toTitleCase } from '@/lib/utils/text';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Briefcase, Building2, CalendarDays, MapPin, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';

// ─── screen ──────────────────────────────────────────────────────────────────

export default function BookingApplicationDetails() {
  const router = useRouter();
  const colors = useThemeColors();
  const { applicationId, id } = useLocalSearchParams();

  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [acceptConfirmOpen, setAcceptConfirmOpen] = React.useState(false);
  const [acceptOtpOpen, setAcceptOtpOpen] = React.useState(false);

  const [{ fetching: rejectUpdating, error: rejectError }, rejectMutate] =
    useHostUpdateBookingApplicationStatusMutation();
  const [{ fetching: initiating }, initiateAccept] = useInitiateAcceptBookingApplicationMutation();
  const [{ fetching: accepting }, acceptMutate] = useAcceptBookingApplicationMutation();

  const [{ data, fetching }] = useBookingApplicationQuery({
    variables: { bookingApplicationId: String(applicationId) },
  });

  const [{ data: hostingData }] = useHostingQuery({
    variables: { hostingId: String(id) },
  });

  const duration = React.useMemo(() => {
    const commencementDate = data?.bookingApplication.commencementDate;
    return hostingDuration(
      hostingData?.hosting.paymentInterval,
      data?.bookingApplication.intervalMultiplier,
      commencementDate ? new Date(commencementDate) : undefined,
    );
  }, [hostingData, data]);

  React.useEffect(() => {
    if (rejectError) handleError(rejectError);
  }, [rejectError]);

  const app = data?.bookingApplication;

  function handleReject() {
    if (!app?.id) return;
    rejectMutate({
      input: {
        bookingApplicationId: app.id,
        status: BookingApplicationStatus.Rejected,
      },
    }).then((res) => {
      if (res.data?.hostUpdateBookingApplicationStatus) {
        toast.show({
          type: 'success',
          text1: 'Application Rejected',
          text2: res.data.hostUpdateBookingApplicationStatus.message,
        });
        router.replace('/host/listings');
      }
    });
  }

  function handleInitiateAccept() {
    if (!app?.id) return;
    initiateAccept({ applicationId: app.id }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      setAcceptConfirmOpen(false);
      setAcceptOtpOpen(true);
    });
  }

  function handleAccept(otp: string) {
    if (!app?.id) return;
    acceptMutate({ applicationId: app.id, otp }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      setAcceptOtpOpen(false);
      toast.show({
        type: 'success',
        text1: 'Application Accepted',
        text2: 'The application has been accepted successfully.',
      });
      router.replace('/host/listings');
    });
  }

  const statusColor = app?.status
    ? BOOKING_APPLICATION_STATUS_COLORS[app.status]
    : hexToRgba(colors.text, 0.4);
  const coverUrl = app?.hosting?.coverImage?.asset?.publicUrl;
  const location = [app?.hosting?.city, app?.hosting?.state].filter(Boolean).join(', ');

  const loading = rejectUpdating || initiating || accepting;

  return (
    <>
      <DetailsLayout
        title="Booking Application"
        footer={
          <View className="flex-row gap-4 p-4 pb-8" style={{ backgroundColor: colors.background }}>
            <Button
              className="flex-1"
              variant="outline"
              type="error"
              style={{ borderColor: hexToRgba(colors.error, 0.6) }}
              onPress={() => setRejectOpen(true)}
            >
              <ThemedText style={{ color: hexToRgba(colors.error, 0.9) }}>Reject</ThemedText>
            </Button>
            <Button type="primary" className="flex-1" onPress={() => setAcceptConfirmOpen(true)}>
              <ThemedText content="primary">Accept</ThemedText>
            </Button>
          </View>
        }
      >
        {fetching ? (
          <View style={{ gap: 14, paddingTop: 8 }}>
            <Skeleton style={{ height: 160, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
            <Skeleton style={{ height: 130, borderRadius: 16 }} />
          </View>
        ) : (
          <View style={{ gap: 14, paddingBottom: 8 }}>
            {/* Property preview */}
            <ReviewSection
              borderless
              icon={<Building2 size={15} color={colors.primary} />}
              title="Property"
            >
              <View style={{ gap: 10 }}>
                <Image
                  source={coverUrl ? { uri: coverUrl } : FALLBACK_IMAGE}
                  placeholder={{ blurhash: PROPERTY_BLURHASH }}
                  contentFit="cover"
                  style={{ width: '100%', height: 140, borderRadius: 10 }}
                />
                <View style={{ gap: 4 }}>
                  <ThemedText style={{ fontSize: 14, fontFamily: Fonts.semibold }}>
                    {app?.hosting?.title ?? hostingData?.hosting.title ?? '—'}
                  </ThemedText>
                  {location ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
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
                </View>
              </View>
            </ReviewSection>

            {/* Application status */}
            <ReviewSection
              icon={<ShieldCheck size={15} color={colors.primary} />}
              title="Application Status"
            >
              {app?.status && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                      {toTitleCase(app.status.replaceAll('_', ' '))}
                    </ThemedText>
                  </View>
                </View>
              )}
              {app?.statusDetails && <DataRow label="Details" value={app.statusDetails} />}
              <DataRow
                label="Submitted"
                value={
                  app?.createdAt
                    ? new Date(app.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'
                }
              />
              <DataRow label="Ref #" value={app?.id?.slice(-6).toUpperCase() ?? '—'} />
            </ReviewSection>

            {/* Lease terms */}
            <ReviewSection
              icon={<CalendarDays size={15} color={colors.primary} />}
              title="Lease Terms"
            >
              <DataRow label="Commencement" value={duration.startDateFormatted} accent />
              <DataRow label="Expiry" value={duration.endDateFormatted} />
              <DataRow label="Duration" value={toTitleCase(duration.metric)} />
            </ReviewSection>

            {/* Personal information */}
            <ReviewSection
              icon={<User size={15} color={colors.primary} />}
              title="Personal Information"
            >
              <DataRow label="Full Name" value={app?.fullName ?? ''} />
              <DataRow label="Email" value={app?.email ?? ''} />
              <DataRow label="Phone" value={app?.phoneNumber ?? ''} />
              {app?.correspondenceAddress && (
                <StackedRow label="Address" value={app.correspondenceAddress} />
              )}
            </ReviewSection>

            {/* Guest profile */}
            <ReviewSection
              icon={<Briefcase size={15} color={colors.primary} />}
              title="Guest Profile"
            >
              {app?.guestFormData?.occupancyTypes && (
                <DataRow label="Occupancy" value={toTitleCase(app.guestFormData.occupancyTypes)} />
              )}
              {app?.guestFormData?.employmentStatus && (
                <DataRow
                  label="Employment"
                  value={toTitleCase(app.guestFormData.employmentStatus)}
                />
              )}
              {app?.guestFormData?.incomeRanges && (
                <DataRow
                  label="Income Range"
                  value={
                    BOOKING_APPLICATION_INCOME_RANGES.find(
                      (v) => v.value === app.guestFormData?.incomeRanges,
                    )?.label ?? toTitleCase(app.guestFormData.incomeRanges)
                  }
                />
              )}
              {app?.guestFormData?.guarantorRelationships && (
                <DataRow
                  label="Guarantor"
                  value={toTitleCase(app.guestFormData.guarantorRelationships)}
                />
              )}
            </ReviewSection>
          </View>
        )}
      </DetailsLayout>

      <ConfirmationSheet
        prompt="Reject Application"
        description="Are you sure you want to reject this application?"
        confirmPrompt="Reject"
        confirmMode="error"
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />

      <ConfirmationSheet
        prompt="Accept Application"
        description="Are you sure you want to accept this application? All other pending applications for this property will be automatically rejected."
        confirmPrompt="Send Confirmation Code"
        confirmMode="default"
        open={acceptConfirmOpen}
        onClose={() => setAcceptConfirmOpen(false)}
        onConfirm={handleInitiateAccept}
      />

      <PINModal
        label="Enter OTP"
        description="A confirmation code has been sent to your email. Enter it below to accept the application."
        length={6}
        onSubmit={handleAccept}
        open={acceptOtpOpen}
        onClose={() => setAcceptOtpOpen(false)}
      />

      <LoadingModal visible={loading} />
    </>
  );
}
