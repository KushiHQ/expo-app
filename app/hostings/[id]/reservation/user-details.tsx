import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { View } from "react-native";

export default function ReservationUserDetails() {
  return (
    <DetailsLayout title="Reservation Details">
      <View className="mt-8">
        <ThemedText style={{ fontSize: 18, fontFamily: Fonts.bold }}>
          Your Information Details
        </ThemedText>
      </View>
      <View className="mt-5 gap-5">
        <FloatingLabelInput
          autoComplete="name"
          focused
          label="Fullname"
          placeholder="John Doe"
        />
        <FloatingLabelInput
          inputMode="email"
          autoComplete="email"
          focused
          label="Email"
          placeholder="example@email.com"
        />
        <FloatingLabelInput
          inputMode="tel"
          autoComplete="tel"
          focused
          label="Phone Number"
          placeholder="08034598710"
        />
        <View></View>
      </View>
    </DetailsLayout>
  );
}
