import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import BookingCard from "@/components/molecules/m-booking-card";
import TextPill from "@/components/molecules/m-text-pill-pill";
import { useBookingsQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import React from "react";
import { View } from "react-native";

const BOOKING_TYPES = ["Active", "Completed"] as const;

export default function UserBookings() {
  const [selected, setSelected] =
    React.useState<(typeof BOOKING_TYPES)[number]>("Active");
  const [{ data, fetching }] = useBookingsQuery();

  const bookings = data?.bookings ?? [];

  return (
    <DetailsLayout title="My Bookings">
      <View className="mt-4">
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
      </View>
      <View className="gap-6 mt-8">
        {fetching &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} style={{ height: 140, borderRadius: 10 }} />
          ))}
        {bookings.map((booking, index) => (
          <BookingCard booking={booking} key={index} />
        ))}
      </View>
    </DetailsLayout>
  );
}
