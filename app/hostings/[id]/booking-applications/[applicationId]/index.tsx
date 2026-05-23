import Button from '@/components/atoms/a-button';
import LoadingModal from '@/components/atoms/a-loading-modal';
import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import ConfirmationSheet from '@/components/molecules/m-confirmation-sheet';
import {
  BOOKING_APPLICATION_INCOME_RANGES,
  BOOKING_APPLICATION_STATUS_COLORS,
} from '@/lib/constants/booking/application';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  BookingApplicationStatus,
  useBookingApplicationQuery,
  useHostingQuery,
  useHostUpdateBookingApplicationStatusMutation,
} from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { hostingDuration } from '@/lib/utils/hosting/tenancyAgreement';
import { capitalize, toTitleCase } from '@/lib/utils/text';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import {
  Briefcase,
  Building2,
  CalendarDays,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import React from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { toast } from '@/lib/hooks/use-toast';

// ─── local UI primitives ──────────────────────────────────────────────────────

const SectionDivider: React.FC = () => {
  const colors = useThemeColors();
  return (
    <View style={{ height: 1, backgroundColor: hexToRgba(colors.text, 0.07), marginHorizontal: 16 }} />
  );
};

const DataRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <ThemedText
        style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4), width: 112, flexShrink: 0, paddingTop: 1 }}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 13,
          flex: 1,
          color: accent ? colors.primary : hexToRgba(colors.text, 0.9),
          fontFamily: accent ? Fonts.semibold : Fonts.regular,
        }}
      >
        {value || '—'}
      </ThemedText>
    </View>
  );
};

const StackedRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const colors = useThemeColors();
  return (
    <View style={{ gap: 5 }}>
      <ThemedText
        style={{
          fontSize: 10,
          color: hexToRgba(colors.text, 0.38),
          letterSpacing: 0.8,
          fontFamily: Fonts.medium,
        }}
      >
        {label.toUpperCase()}
      </ThemedText>
      <ThemedText style={{ fontSize: 13, lineHeight: 20, color: hexToRgba(colors.text, 0.82) }}>
        {value || '—'}
      </ThemedText>
    </View>
  );
};

const ReviewSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => {
  const colors = useThemeColors();
  return (
    <View style={{ borderRadius: 16, backgroundColor: colors['surface-01'], overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 9 }}>
        {icon}
        <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14, flex: 1 }}>{title}</ThemedText>
      </View>
      <SectionDivider />
      <View style={{ padding: 16, gap: 13 }}>{children}</View>
    </View>
  );
};

// ─── screen ──────────────────────────────────────────────────────────────────

export default function BookingApplicationDetails() {
  const router = useRouter();
  const colors = useThemeColors();
  const { applicationId, id } = useLocalSearchParams();
  const [action, setAction] = React.useState<'reject' | 'accept'>();
  const [{ fetching: updating, error }, mutate] = useHostUpdateBookingApplicationStatusMutation();
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
    if (error) handleError(error);
  }, [error]);

  const app = data?.bookingApplication;

  function handleMutate() {
    if (app?.id && action)
      mutate({
        input: {
          bookingApplicationId: app.id,
          status:
            action === 'reject'
              ? BookingApplicationStatus.Rejected
              : BookingApplicationStatus.HostVerified,
        },
      }).then((res) => {
        if (res.data?.hostUpdateBookingApplicationStatus) {
          toast.show({
            type: 'success',
            text1: 'Success',
            text2: res.data.hostUpdateBookingApplicationStatus.message,
          });
          router.replace('/host/listings');
        }
      });
  }

  const statusColor = app?.status ? BOOKING_APPLICATION_STATUS_COLORS[app.status] : hexToRgba(colors.text, 0.4);
  const coverUrl = app?.hosting?.coverImage?.asset?.publicUrl;
  const location = [app?.hosting?.city, app?.hosting?.state].filter(Boolean).join(', ');

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
              onPress={() => setAction('reject')}
            >
              <ThemedText style={{ color: hexToRgba(colors.error, 0.9) }}>Reject</ThemedText>
            </Button>
            <Button type="primary" className="flex-1" onPress={() => setAction('accept')}>
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
                    {app?.hosting?.title ?? hostingData?.hosting.title ?? '—'}
                  </ThemedText>
                  {location ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <MapPin size={12} color={hexToRgba(colors.text, 0.4)} />
                      <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4) }}>
                        {location}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </ReviewSection>

            {/* Application status */}
            <ReviewSection icon={<ShieldCheck size={15} color={colors.primary} />} title="Application Status">
              {app?.status && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4), width: 112, flexShrink: 0 }}>
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
                    <ThemedText style={{ fontSize: 12, color: statusColor, fontFamily: Fonts.semibold }}>
                      {toTitleCase(app.status.replaceAll('_', ' '))}
                    </ThemedText>
                  </View>
                </View>
              )}
              {app?.statusDetails && (
                <DataRow label="Details" value={app.statusDetails} />
              )}
              <DataRow
                label="Submitted"
                value={app?.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              />
              <DataRow label="Ref #" value={app?.id?.slice(-6).toUpperCase() ?? '—'} />
            </ReviewSection>

            {/* Lease terms */}
            <ReviewSection icon={<CalendarDays size={15} color={colors.primary} />} title="Lease Terms">
              <DataRow label="Commencement" value={duration.startDateFormatted} accent />
              <DataRow label="Expiry" value={duration.endDateFormatted} />
              <DataRow label="Duration" value={toTitleCase(duration.metric)} />
            </ReviewSection>

            {/* Personal information */}
            <ReviewSection icon={<User size={15} color={colors.primary} />} title="Personal Information">
              <DataRow label="Full Name" value={app?.fullName ?? ''} />
              <DataRow label="Email" value={app?.email ?? ''} />
              <DataRow label="Phone" value={app?.phoneNumber ?? ''} />
              {app?.correspondenceAddress && (
                <StackedRow label="Address" value={app.correspondenceAddress} />
              )}
            </ReviewSection>

            {/* Guest profile */}
            <ReviewSection icon={<Briefcase size={15} color={colors.primary} />} title="Guest Profile">
              {app?.guestFormData?.occupancyTypes && (
                <DataRow label="Occupancy" value={toTitleCase(app.guestFormData.occupancyTypes)} />
              )}
              {app?.guestFormData?.employmentStatus && (
                <DataRow label="Employment" value={toTitleCase(app.guestFormData.employmentStatus)} />
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
        prompt={`${capitalize(action ?? '')} Application`}
        description={
          action === 'reject'
            ? 'Are you sure you want to reject this application?'
            : 'Are you sure you want to accept this application? All other applications will be automatically rejected.'
        }
        confirmPrompt={action === 'reject' ? 'Reject' : 'Accept'}
        confirmMode={action === 'reject' ? 'error' : 'default'}
        open={!!action}
        onClose={() => setAction(undefined)}
        onConfirm={handleMutate}
      />
      <LoadingModal visible={updating} />
    </>
  );
}
