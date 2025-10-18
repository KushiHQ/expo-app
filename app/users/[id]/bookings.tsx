import DetailsLayout from "@/components/layouts/details";
import BookingCard from "@/components/molecules/m-booking-card";
import TextPill from "@/components/molecules/m-text-pill-pill";
import { generateMockBookings } from "@/lib/constants/mocks/bookings";
import { hostingsAtom } from "@/lib/stores/hostings";
import { cast } from "@/lib/types/utils";
import { useAtomValue } from "jotai";
import React from "react";
import { View } from "react-native";

const BOOKING_TYPES = ["Active", "Completed"] as const;

export default function UserBookings() {
  const [selected, setSelected] =
    React.useState<(typeof BOOKING_TYPES)[number]>("Active");
  const hostings = useAtomValue(hostingsAtom);
  const bookings = React.useMemo(
    () => generateMockBookings(5, hostings),
    [hostings],
  );

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
        {bookings.map((booking, index) => (
          <BookingCard booking={booking} key={index} />
        ))}
      </View>
    </DetailsLayout>
  );
}
