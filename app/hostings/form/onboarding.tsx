import ThemedText from "@/components/atoms/a-themed-text";
import { FluentFormMultiple24Regular } from "@/components/icons/i-document";
import DetailsLayout from "@/components/layouts/details";
import HostingFormOnboardingAction from "@/components/molecules/m-hosting-form-onboarding-action";
import ListingListItem from "@/components/organisms/o-listing-list-item";
import TopListingCard from "@/components/molecules/m-top-listing-card";
import { getVisibleSteps } from "@/lib/constants/hosting/onboarding";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
  HostingKind,
  PublishStatus,
  useBookingApplicationsCountQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { Href, useLocalSearchParams } from "expo-router";
import { useRouter } from "@/lib/hooks/use-router";
import {
  Building2,
  CircleQuestionMark,
  ListChecks,
  LucideIcon,
} from "lucide-react-native";
import React from "react";
import { RefreshControl, View } from "react-native";

type Action = {
  filled: boolean;
  disabled: boolean;
  link: Href;
  /** optional steps never gate the steps after them, even when not filled */
  optional?: boolean;
};

/** A consistent, premium section header: a soft primary icon chip + title,
 *  with an optional count pill. */
const SectionHeader: React.FC<{
  icon: LucideIcon;
  title: string;
  count?: number;
}> = ({ icon: Icon, title, count }) => {
  const colors = useThemeColors();
  return (
    <View className="mb-3 flex-row items-center gap-2.5">
      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
      >
        <Icon size={14} color={colors.primary} />
      </View>
      <ThemedText
        style={{ fontFamily: Fonts.bold, fontSize: 16, letterSpacing: -0.3 }}
      >
        {title}
      </ThemedText>
      {count != null ? (
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: hexToRgba(colors.text, 0.08) }}
        >
          <ThemedText
            style={{
              fontSize: 12,
              fontFamily: Fonts.semibold,
              color: hexToRgba(colors.text, 0.7),
            }}
          >
            {count}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
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

  // A deleted unit must simply vanish from the host's view. The server archives
  // (rather than hard-deletes) a unit that has bookings, so we also hide archived
  // units and always speak of it as "deleted" — the host never sees "archived".
  const units = (hosting?.children ?? []).filter(
    (u) => u.publishStatus !== PublishStatus.Archived,
  );

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
          : `/hostings/form/${originalIndex === 2
            ? "step-2-video"
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
        actions[i0].filled =
          !!hosting.title && !!hosting.propertyType && !!hosting.listingType;
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
        // The GPS pin (coords) is the real signal; a postal code is unrealistic
        // for most Nigerian addresses and a state/city can be missing in remote
        // areas — so require the coords + contact + at least one locality label,
        // not every field.
        actions[iLocation].filled = !!(
          hosting.longitude &&
          hosting.latitude &&
          hosting.country &&
          hosting.contact &&
          (hosting.state || hosting.city)
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
        actions[iPricing].filled = !!(hosting.price && hosting.paymentDetails);
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
        actions[iVerified].filled =
          hosting.publishStatus === PublishStatus.Live;
      }
    }

    visibleSteps.forEach((_, filteredIndex) => {
      if (filteredIndex !== 0) {
        const prev = actions[filteredIndex - 1];
        // An optional previous step (e.g. the video walkthrough) never blocks
        // the next step, even if it hasn't been filled.
        actions[filteredIndex]["disabled"] =
          prev.disabled || (!prev.filled && !prev.optional);
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
        <ThemedText
          className="mb-4"
          style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
        >
          <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
          {"  "}
          Resume your setup, edit your property details, or preview your listing
          before it reaches future tenants.
        </ThemedText>
        <TopListingCard
          onPress={() => router.push(`/hostings/${hosting?.id}`)}
          hosting={hosting}
        />
        {/* A parent property isn't booked directly — applications belong to its
            units — so the booking-applications section is hidden for parents. */}
        {hosting?.kind !== HostingKind.Parent ? (
          <View className="py-4">
            <HostingFormOnboardingAction
              icon={FluentFormMultiple24Regular}
              color="accent"
              onPress={() =>
                router.push(`/hostings/${hosting?.id}/booking-applications/`)
              }
            >
              <View className="flex-1">
                <ThemedText style={{ fontFamily: Fonts.bold }}>
                  Booking Applications (
                  {Number(
                    countData?.bookingApplicationsCount ?? "0",
                  ).toLocaleString()}
                  )
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.6),
                  }}
                >
                  Review and manage pending tenant applications for this
                  property.
                </ThemedText>
              </View>
            </HostingFormOnboardingAction>
          </View>
        ) : null}

        {/* Units — only for a parent property. Lists its child units; tap to
            manage one (drills into that unit's own onboarding). */}
        {hosting && hosting.kind === HostingKind.Parent ? (
          <View className="py-4">
            <SectionHeader
              icon={Building2}
              title="Units"
              count={units.length}
            />
            {units.length === 0 ? (
              <ThemedText
                style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
              >
                No units yet. Add one with the + button and choose this property
                as its parent.
              </ThemedText>
            ) : (
              // Units are just listings — render them with the same row as the
              // host's listings (tap to manage, ⋯ menu to view/delete).
              <View className="gap-3">
                {units.map((unit) => (
                  <ListingListItem
                    key={unit.id}
                    hosting={unit}
                    onDelete={refetch}
                    onDuplicate={refetch}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View className="mt-8">
          <SectionHeader icon={ListChecks} title="Complete your listing" />
          <View className="gap-4">
            {visibleSteps.map((step, filteredIndex) => {
              return (
                <HostingFormOnboardingAction
                  key={filteredIndex}
                  onPress={() => {
                    if (actions[filteredIndex]?.link) {
                      router.push(actions[filteredIndex]!.link);
                    }
                  }}
                  disabled={
                    !actions[filteredIndex]?.link ||
                    actions[filteredIndex]?.disabled
                  }
                  color={actions[filteredIndex]?.filled ? "primary" : "default"}
                  icon={step.icon}
                >
                  <View className="flex-1">
                    <ThemedText style={{ fontFamily: Fonts.bold }}>
                      {step.title}
                    </ThemedText>
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
      </View>
    </DetailsLayout>
  );
}
