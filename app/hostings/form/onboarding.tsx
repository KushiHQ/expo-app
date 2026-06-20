import ThemedText from '@/components/atoms/a-themed-text';
import { FluentFormMultiple24Regular } from '@/components/icons/i-document';
import DetailsLayout from '@/components/layouts/details';
import HostingFormOnboardingAction from '@/components/molecules/m-hosting-form-onboarding-action';
import TopListingCard from '@/components/molecules/m-top-listing-card';
import { ONBOARDING_STEPS, getVisibleSteps } from '@/lib/constants/hosting/onboarding';
import { Fonts } from '@/lib/constants/theme';
import { useHostingForm } from '@/lib/hooks/hosting-form';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { PublishStatus, useBookingApplicationsCountQuery } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { Href, useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { CircleQuestionMark } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, View } from 'react-native';

type Action = {
  filled: boolean;
  disabled: boolean;
  link: Href;
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
          : `/hostings/form/step-${originalIndex + 1}?id=${hosting?.id}`,
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

      // Step 2: Location
      const i2 = idx(2);
      if (i2 >= 0) {
        actions[i2].filled = !!(
          hosting.longitude &&
          hosting.latitude &&
          hosting.state &&
          hosting.country &&
          hosting.city &&
          hosting.postalCode &&
          hosting.contact
        );
      }

      // Step 3: Amenities
      const i3 = idx(3);
      if (i3 >= 0) {
        actions[i3].filled = !!hosting.facilities?.length;
      }

      // Step 4: Pricing
      const i4 = idx(4);
      if (i4 >= 0) {
        actions[i4].filled = !!(hosting.paymentInterval && hosting.price && hosting.paymentDetails);
      }

      // Step 5: Mandate
      const i5 = idx(5);
      if (i5 >= 0) {
        const v = hosting.verification;
        actions[i5].filled = !!(
          v?.landlordFullName &&
          v?.landlordAddress &&
          v?.propertyRelationship &&
          v?.declOwnership &&
          v?.declLitigation &&
          v?.declIndemnity
        );
      }

      // Step 6: Tenancy Terms
      const i6 = idx(6);
      if (i6 >= 0) {
        actions[i6].filled = !!(
          hosting.tenancyAgreementTemplate?.sections &&
          hosting.tenancyAgreementTemplate.sections?.length > 0 &&
          hosting.host?.signature?.publicUrl
        );
      }

      // Step 7: Review & Publish
      const i7 = idx(7);
      if (i7 >= 0) {
        actions[i7].filled =
          hosting.publishStatus === PublishStatus.Inreview ||
          hosting.publishStatus === PublishStatus.Live;
      }

      // Step 8: Get Verified
      const i8 = idx(8);
      if (i8 >= 0) {
        actions[i8].filled = hosting.publishStatus === PublishStatus.Live;
      }
    }

    visibleSteps.forEach((_, filteredIndex) => {
      if (filteredIndex !== 0) {
        actions[filteredIndex]['disabled'] =
          actions[filteredIndex - 1].disabled || !actions[filteredIndex - 1].filled;
      }
    });

    return actions;
  }, [hosting, visibleSteps, indexMap]);

  return (
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
  );
}
