import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import EmptyList from "@/components/molecules/m-empty-list";
import { BOOKING_APPLICATION_STATUS_COLORS } from "@/lib/constants/booking/application";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
  useBookingApplicationsQuery,
  useHostingQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { hostingDuration } from "@/lib/utils/hosting/tenancyAgreement";
import { toTitleCase } from "@/lib/utils/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { Pressable, RefreshControl, View } from "react-native";

export default function BookingApplications() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const router = useRouter();
  const [{ fetching: hostingFetching, data: hostingData }] = useHostingQuery({
    variables: {
      hostingId: String(id),
    },
  });
  const [{ fetching, data, error }, refetch] = useBookingApplicationsQuery({
    variables: {
      filter: {
        hostingId: String(id),
        authGuest: true,
      },
    },
  });

  React.useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  return (
    <DetailsLayout
      title="Booking Applications"
      refreshControl={
        <RefreshControl
          refreshing={fetching}
          onRefresh={() => refetch({ requestPolicy: "network-only" })}
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
          See who wants to move in. Review guest profiles, income details, and
          guarantor information before approving a booking.
        </ThemedText>
        <View className="gap-4">
          {fetching ||
            (hostingFetching &&
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  style={{ height: 90, borderRadius: 12 }}
                />
              )))}
          {data?.bookingApplications.map((app) => (
            <Pressable
              key={app.id}
              onPress={() =>
                router.push(
                  `/hostings/${hostingData?.hosting.id}/booking-applications/${app.id}`,
                )
              }
              className="border p-2.5 px-3 rounded-xl"
              style={{
                borderColor: hexToRgba(colors.text, 0.06),
                backgroundColor: hexToRgba(colors.text, 0.06),
              }}
            >
              <View className="flex-row items-center flex-wrap pga-2 justify-between">
                <ThemedText type="semibold" style={{ fontSize: 18 }}>
                  {app.fullName}
                </ThemedText>
                <ThemedText
                  className="p-1 rounded px-3"
                  style={{
                    fontSize: 12,
                    backgroundColor: hexToRgba(
                      BOOKING_APPLICATION_STATUS_COLORS[app.status],
                      0.2,
                    ),
                    color: BOOKING_APPLICATION_STATUS_COLORS[app.status],
                  }}
                >
                  {toTitleCase(app.status.replaceAll("_", " "))}
                </ThemedText>
              </View>
              <View className="flex-row items-center gap-2">
                <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                  Duration:
                </ThemedText>
                <ThemedText>
                  {toTitleCase(
                    hostingDuration(
                      hostingData?.hosting.paymentInterval,
                      app.intervalMultiplier,
                    ).metric,
                  )}
                </ThemedText>
              </View>

              <View className="flex-row items-center flex-wrap gap-2 justify-between">
                <View className="flex-row items-center gap-2">
                  <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                    Commencement:
                  </ThemedText>
                  <ThemedText>
                    {app.commencementDate
                      ? hostingDuration(
                        hostingData?.hosting.paymentInterval,
                        app.intervalMultiplier,
                        new Date(app.commencementDate),
                      ).startDateFormatted
                      : "nil"}
                  </ThemedText>
                </View>
                <View className="flex-row items-center gap-2">
                  <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                    {new Date(app.createdAt).toISOString().split("T")[0]}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
          {(!fetching || !hostingFetching) &&
            !(data?.bookingApplications ?? []).length && (
              <EmptyList message="No booking applications on this property" />
            )}
        </View>
      </View>
    </DetailsLayout>
  );
}
