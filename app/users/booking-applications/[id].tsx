import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DataRow from '@/components/atoms/a-data-row';
import StackedRow from '@/components/atoms/a-stacked-row';
import ReviewSection from '@/components/molecules/m-review-section';
import DetailsLayout from '@/components/layouts/details';
import {
  BOOKING_APPLICATION_INCOME_RANGES,
  BOOKING_APPLICATION_STATUS_COLORS,
} from '@/lib/constants/booking/application';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import Button from '@/components/atoms/a-button';
import LoadingModal from '@/components/atoms/a-loading-modal';
import ConfirmationSheet from '@/components/molecules/m-confirmation-sheet';
import { toast } from '@/lib/hooks/use-toast';
import {
  useBookingApplicationQuery,
  useCancelBookingApplicationMutation,
  BookingApplicationStatus,
} from '@/lib/services/graphql/generated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hexToRgba } from '@/lib/utils/colors';
import { toTitleCase } from '@/lib/utils/text';
import { Briefcase, Building2, CalendarDays, MapPin, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';

export default function BookingApplicationDetails() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [{ data, fetching }] = useBookingApplicationQuery({
    variables: { bookingApplicationId: String(id) },
  });

  const [{ fetching: cancelling }, cancelApplication] = useCancelBookingApplicationMutation();

  const app = data?.bookingApplication;

  const canCancel = React.useMemo(() => {
    if (!app) return false;
    return (
      app.status !== BookingApplicationStatus.Accepted &&
      app.status !== BookingApplicationStatus.Cancelled &&
      app.status !== BookingApplicationStatus.HostVerified &&
      app.status !== BookingApplicationStatus.AdminVerified
    );
  }, [app]);

  const handleCancel = () => {
    cancelApplication({ applicationId: String(id) }).then((res) => {
      if (res.data?.cancelBookingApplication) {
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.cancelBookingApplication.message,
        });
        setCancelOpen(false);
      }
    });
  };

  const statusColor = app?.status
    ? BOOKING_APPLICATION_STATUS_COLORS[app.status]
    : hexToRgba(colors.text, 0.4);
  const coverUrl = app?.hosting?.coverImage?.asset?.publicUrl;
  const location = [app?.hosting?.city, app?.hosting?.state].filter(Boolean).join(', ');

  return (
    <>
      <DetailsLayout
        title="Application Details"
        footer={
          <View className="flex-row gap-4 p-4 pb-8" style={{ backgroundColor: colors.background }}>
            {app?.booking?.id && (
              <Button
                type="primary"
                className="flex-1"
                onPress={() => router.push(`/bookings/${app.booking?.id}`)}
              >
                <ThemedText content="primary">View Booking</ThemedText>
              </Button>
            )}
            {canCancel && (
              <Button
                className="flex-1"
                variant="outline"
                type="error"
                style={{ borderColor: hexToRgba(colors.error, 0.6) }}
                onPress={() => setCancelOpen(true)}
              >
                <ThemedText style={{ color: hexToRgba(colors.error, 0.9) }}>
                  Cancel Application
                </ThemedText>
              </Button>
            )}
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
            <ReviewSection icon={<Building2 size={15} color={colors.primary} />} title="Property">
              <View style={{ gap: 10 }}>
                <Image
                  source={coverUrl ? { uri: coverUrl } : FALLBACK_IMAGE}
                  placeholder={{ blurhash: PROPERTY_BLURHASH }}
                  contentFit="cover"
                  style={{ width: '100%', height: 140, borderRadius: 10 }}
                />
                <View style={{ gap: 4 }}>
                  <ThemedText style={{ fontSize: 14, fontFamily: Fonts.semibold }}>
                    {app?.hosting?.title ?? '—'}
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
                      backgroundColor: hexToRgba(statusColor, 0.16),
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
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
              <DataRow label="Details" value={app?.statusDetails ?? 'No additional details.'} />
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
              <DataRow
                label="Last Updated"
                value={
                  app?.lastUpdated
                    ? new Date(app.lastUpdated).toLocaleDateString('en-GB', {
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
            {app?.commencementDate && (
              <ReviewSection
                icon={<CalendarDays size={15} color={colors.primary} />}
                title="Lease Terms"
              >
                <DataRow
                  label="Commencement"
                  value={new Date(app.commencementDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  accent
                />
                {app.intervalMultiplier != null && (
                  <DataRow label="Duration" value={`${app.intervalMultiplier} payment period(s)`} />
                )}
              </ReviewSection>
            )}

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
        prompt="Cancel Application"
        description="Are you sure you want to cancel this booking application?"
        confirmPrompt="Yes, Cancel"
        confirmMode="error"
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
      <LoadingModal visible={cancelling} />
    </>
  );
}
