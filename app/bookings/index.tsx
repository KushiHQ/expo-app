import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import BookingCard from "@/components/molecules/m-booking-card";
import EmptyList from "@/components/molecules/m-empty-list";
import TextPill from "@/components/molecules/m-text-pill-pill";
import { useBookingsQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";

const BOOKING_TYPES = ["Active", "Completed"] as const;

export default function UserBookings() {
  const [selected, setSelected] =
    React.useState<(typeof BOOKING_TYPES)[number]>("Active");

  const {
    items: bookings,
    fetching,
    loadMore,
    hasNextPage,
    refresh,
  } = useInfiniteQuery(useBookingsQuery, {
    queryKey: "bookings",
    initialVariables: {},
  });

  return (
    <DetailsLayout
      title="My Bookings"
      scrollable={false}
    >
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        renderItem={({ item }) => (
          <View className="mb-6">
            <BookingCard booking={item} />
          </View>
        )}
        ListHeaderComponent={
          <View className="mb-8 mt-4">
            <View className="flex-row items-center gap-2">
              {BOOKING_TYPES.map((v, index) => (
                <TextPill
                  selected={selected === v}
                  key={index}
                  onSelect={(v) => setSelected(cast(v))}
                >
                  {v}
                </TextPill>
              ))}
            </View>
            {fetching && !bookings.length && (
              <View className="gap-6 mt-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    style={{ height: 140, borderRadius: 10 }}
                  />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !fetching && !bookings.length ? (
            <EmptyList message="No bookings yet" />
          ) : null
        }
        onEndReached={() => hasNextPage && loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={fetching} onRefresh={() => refresh()} />
        }
      />
    </DetailsLayout>
  );
}
