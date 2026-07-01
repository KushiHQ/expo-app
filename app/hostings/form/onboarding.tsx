import ThemedText from '@/components/atoms/a-themed-text';
import { FluentFormMultiple24Regular } from '@/components/icons/i-document';
import DetailsLayout from '@/components/layouts/details';
import HostingFormOnboardingAction from '@/components/molecules/m-hosting-form-onboarding-action';
import HostingUnitCard from '@/components/molecules/m-hosting-unit-card';
import TopListingCard from '@/components/molecules/m-top-listing-card';
import { ONBOARDING_STEPS, getVisibleSteps } from '@/lib/constants/hosting/onboarding';
import { Fonts } from '@/lib/constants/theme';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  HostingKind,
  PublishStatus,
  useBookingApplicationsCountQuery,
  useDeleteHostingMutation,
} from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { Href, useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import ThemedModal from '@/components/molecules/m-modal';
import Button from '@/components/atoms/a-button';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';
import { cast } from '@/lib/types/utils';
import { CircleQuestionMark } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, View } from 'react-native';

type Action = {
  filled: boolean;
  disabled: boolean;
  link: Href;
  /** optional steps never gate the steps after them, even when not filled */
  optional?: boolean;
};

export default function HostingOnboarding() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { hosting, refetch, fetching } = useHostingForm(id);
  const [{ data: countData }] = useBookingApplicationsCountQuery({
    variables: {
      filter: {
        hostingId: hosting?.id,
        authHost: true,
      },
    },
  });

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  const [{ fetching: deletingUnit }, deleteUnit] = useDeleteHostingMutation();
  const [unitToDelete, setUnitToDelete] = React.useState<{ id: string; title: string } | null>(
    null,
  );

  // A deleted unit must simply vanish from the host's view. The server archives
  // (rather than hard-deletes) a unit that has bookings, so we also hide archived
  // units and always speak of it as "deleted" — the host never sees "archived".
  const units = (hosting?.children ?? []).filter(
    (u) => u.publishStatus !== PublishStatus.Archived,
  );

  const confirmDeleteUnit = () => {
    if (!unitToDelete) return;
    deleteUnit({ hostingId: unitToDelete.id }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      if (res.data?.deleteHosting) {
        toast.show({ type: 'success', text1: 'Deleted', text2: 'The unit was deleted.' });
        setUnitToDelete(null);
        refetch();
      }
    });
  };

  const { steps: visibleSteps, indexMap } = React.useMemo(
    () => getVisibleSteps(hosting?.listingType, hosting?.propertyType),
    [hosting?.listingType, hosting?.propertyType],
  );

  const actions = React.useMemo(() => {
    const actions: Record<number, Action> = {};
    visibleSteps.forEach((_, filteredIndex) => {
      const originalIndex = indexMap[filteredIndex];
      const isLast = filteredIndex === visibleSteps.length - 1;
      actions[filteredIndex] = {
        filled: false,
        disabled: true,
        link: isLast
          ? `/hostings/form/verification/overview?id=${hosting?.id}`
          : `/hostings/form/${
              originalIndex === 2
                ? 'step-2-video'
                : originalIndex < 2
                  ? `step-${originalIndex + 1}`
                  : `step-${originalIndex}`
            }?id=${hosting?.id}`,
      };
    });

    if (hosting) {
      // Find filteredIndex for each original step
      const idx = (original: number) => indexMap.indexOf(original);

      // Step 0: Property Details
      const i0 = idx(0);
      if (i0 >= 0) {
        actions[i0].filled = !!hosting.title && !!hosting.propertyType && !!hosting.listingType;
        actions[i0].disabled = false;
      }

      // Step 1: Photos
      const i1 = idx(1);
      if (i1 >= 0) {
        actions[i1].filled = !!hosting.rooms?.some(
          (room) => room?.images && room.images.length > 0,
        );
      }

      // Step 2: Video Walkthrough — optional: reflect whether a video exists,
      // but mark optional so an empty one never blocks the steps after it.
      const iVideo = idx(2);
      if (iVideo >= 0) {
        actions[iVideo].filled = !!hosting.video;
        actions[iVideo].optional = true;
      }

      // Step 3: Location
      const iLocation = idx(3);
      if (iLocation >= 0) {
        actions[iLocation].filled = !!(
          hosting.longitude &&
          hosting.latitude &&
          hosting.state &&
          hosting.country &&
          hosting.city &&
          hosting.postalCode &&
          hosting.contact
        );
      }

      // Step 4: Amenities
      const iAmenities = idx(4);
      if (iAmenities >= 0) {
        actions[iAmenities].filled = !!hosting.facilities?.length;
      }

      // Step 5: Pricing
      const iPricing = idx(5);
      if (iPricing >= 0) {
        actions[iPricing].filled = !!(
          hosting.paymentInterval &&
          hosting.price &&
          hosting.paymentDetails
        );
      }

      // Step 6: Mandate
      const iMandate = idx(6);
      if (iMandate >= 0) {
        const v = hosting.verification;
        actions[iMandate].filled = !!(
          v?.landlordFullName &&
          v?.landlordAddress &&
          v?.propertyRelationship &&
          v?.declOwnership &&
          v?.declLitigation &&
          v?.declIndemnity
        );
      }

      // Step 7: Tenancy Terms
      const iTenancy = idx(7);
      if (iTenancy >= 0) {
        actions[iTenancy].filled = !!(
          hosting.tenancyAgreementTemplate?.sections &&
          hosting.tenancyAgreementTemplate.sections?.length > 0 &&
          hosting.host?.signature?.publicUrl
        );
      }

      // Step 8: Review & Publish
      const iReview = idx(8);
      if (iReview >= 0) {
        actions[iReview].filled =
          hosting.publishStatus === PublishStatus.Inreview ||
          hosting.publishStatus === PublishStatus.Live;
      }

      // Step 9: Get Verified
      const iVerified = idx(9);
      if (iVerified >= 0) {
        actions[iVerified].filled = hosting.publishStatus === PublishStatus.Live;
      }
    }

    visibleSteps.forEach((_, filteredIndex) => {
      if (filteredIndex !== 0) {
        const prev = actions[filteredIndex - 1];
        // An optional previous step (e.g. the video walkthrough) never blocks
        // the next step, even if it hasn't been filled.
        actions[filteredIndex]['disabled'] = prev.disabled || (!prev.filled && !prev.optional);
      }
    });

    return actions;
  }, [hosting, visibleSteps, indexMap]);

  return (
    <>
    <DetailsLayout
      title="Hosting"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            refetch();
          }}
        />
      }
    >
      <View>
        <ThemedText className="mb-4" style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
          <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
          {'  '}
          Resume your setup, edit your property details, or preview your listing before it reaches
          future tenants.
        </ThemedText>
        <TopListingCard onPress={() => router.push(`/hostings/${hosting?.id}`)} hosting={hosting} />
        {/* A parent property isn't booked directly — applications belong to its
            units — so the booking-applications section is hidden for parents. */}
        {hosting?.kind !== HostingKind.Parent ? (
          <View className="border-b py-4" style={{ borderColor: hexToRgba(colors.text, 0.15) }}>
            <HostingFormOnboardingAction
              icon={FluentFormMultiple24Regular}
              color="accent"
              onPress={() => router.push(`/hostings/${hosting?.id}/booking-applications/`)}
            >
              <View className="flex-1">
                <ThemedText style={{ fontFamily: Fonts.bold }}>
                  Booking Applications (
                  {Number(countData?.bookingApplicationsCount ?? '0').toLocaleString()})
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.6),
                  }}
                >
                  Review and manage pending tenant applications for this property.
                </ThemedText>
              </View>
            </HostingFormOnboardingAction>
          </View>
        ) : null}

        {/* Units — only for a parent property. Lists its child units; tap to
            manage one (drills into that unit's own onboarding). */}
        {hosting && hosting.kind === HostingKind.Parent ? (
          <View className="border-b py-4" style={{ borderColor: hexToRgba(colors.text, 0.15) }}>
            <ThemedText style={{ fontFamily: Fonts.bold, marginBottom: 10 }}>
              Units ({units.length})
            </ThemedText>
            {units.length === 0 ? (
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
                No units yet. Add one with the + button and choose this property as its parent.
              </ThemedText>
            ) : (
              <View className="gap-3">
                {units.map((unit) => (
                  <HostingUnitCard
                    key={unit.id}
                    title={unit.title}
                    coverUrl={
                      unit.coverImage?.asset?.id
                        ? getAssetResizeUrl(unit.coverImage.asset.id, 240, 240, 80)
                        : (unit.coverImage?.asset?.publicUrl ?? undefined)
                    }
                    price={unit.price}
                    paymentInterval={unit.paymentInterval}
                    publishStatus={unit.publishStatus}
                    onPress={() =>
                      router.push(`/hostings/form/onboarding?id=${unit.id}` as Href)
                    }
                    onDelete={() =>
                      setUnitToDelete({ id: cast(unit.id), title: unit.title ?? 'this unit' })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View className="mt-8 gap-4">
          {visibleSteps.map((step, filteredIndex) => {
            return (
              <HostingFormOnboardingAction
                key={filteredIndex}
                onPress={() => {
                  if (actions[filteredIndex]?.link) {
                    router.push(actions[filteredIndex]!.link);
                  }
                }}
                disabled={!actions[filteredIndex]?.link || actions[filteredIndex]?.disabled}
                color={actions[filteredIndex]?.filled ? 'primary' : 'default'}
                icon={step.icon}
              >
                <View className="flex-1">
                  <ThemedText style={{ fontFamily: Fonts.bold }}>{step.title}</ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: hexToRgba(colors.text, 0.6),
                    }}
                  >
                    {step.description}
                  </ThemedText>
                </View>
              </HostingFormOnboardingAction>
            );
          })}
        </View>
      </View>
    </DetailsLayout>
      <ThemedModal visible={!!unitToDelete} onClose={() => setUnitToDelete(null)}>
        <View className="mt-8 items-center gap-2">
          <ThemedText style={{ fontFamily: Fonts.medium }}>Delete this unit?</ThemedText>
          <ThemedText
            style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14, textAlign: 'center' }}
          >
            {unitToDelete?.title} will be removed from this property. This cannot be undone.
          </ThemedText>
          <View className="mt-8 w-full flex-row gap-4">
            <Button type="tinted" className="flex-1" onPress={() => setUnitToDelete(null)}>
              <ThemedText content="tinted">Cancel</ThemedText>
            </Button>
            <Button
              type="error"
              className="flex-1"
              loading={deletingUnit}
              onPress={confirmDeleteUnit}
            >
              <ThemedText content="error">Delete</ThemedText>
            </Button>
          </View>
        </View>
      </ThemedModal>
    </>
  );
}
