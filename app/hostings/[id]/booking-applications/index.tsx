import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import EmptyList from '@/components/molecules/m-empty-list';
import { BOOKING_APPLICATION_STATUS_COLORS } from '@/lib/constants/booking/application';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useBookingApplicationsQuery, useHostingQuery } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { hostingDuration } from '@/lib/utils/hosting/tenancyAgreement';
import { toTitleCase } from '@/lib/utils/text';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { CircleQuestionMark } from 'lucide-react-native';
import React from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import BookingApplicationCard from '@/components/molecules/m-booking-application-card';
import { cast } from '@/lib/types/utils';

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
        authHost: true,
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
          onRefresh={() => refetch({ requestPolicy: 'network-only' })}
        />
      }
    >
      <View>
        <ThemedText className="mb-4" style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
          <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
          {'  '}
          See who wants to move in. Review guest profiles, income details, and guarantor information
          before approving a booking.
        </ThemedText>
        <View className="gap-4">
          {fetching ||
            (hostingFetching &&
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} style={{ height: 90, borderRadius: 12 }} />
              )))}
          {data?.bookingApplications.map((app) => (
            <BookingApplicationCard host application={cast(app)} key={app.id} />
          ))}
          {(!fetching || !hostingFetching) && !(data?.bookingApplications ?? []).length && (
            <EmptyList message="No booking applications on this property" />
          )}
        </View>
      </View>
    </DetailsLayout>
  );
}
