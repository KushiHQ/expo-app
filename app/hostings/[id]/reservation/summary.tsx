import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingSummaryCard from "@/components/molecules/m-hosting-summary-card";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { View } from "react-native";

export default function ReservationSummary() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const hostings = useAtomValue(hostingsAtom);
  const hosting = hostings.find((hosting) => hosting.id === id);

  return (
    <DetailsLayout title="Reservation Summary">
      <View className="flex-1 gap-4 justify-between">
        <View className="mt-8 gap-8">
          <View
            className="border-b pb-8"
            style={{ borderColor: hexToRgba(colors.text, 0.1) }}
          >
            {hosting && <HostingSummaryCard hosting={hosting} />}
          </View>
          <View
            className="p-4 px-6 border rounded-xl gap-3"
            style={{ borderColor: hexToRgba(colors.text, 0.15) }}
          >
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Date
              </ThemedText>
              <ThemedText>
                {new Date().toLocaleDateString()} -{" "}
                {new Date().toLocaleDateString()}
              </ThemedText>
            </View>
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Duration
              </ThemedText>
              <ThemedText>1 Year</ThemedText>
            </View>
          </View>
          <View
            className="p-4 px-6 border rounded-xl gap-3"
            style={{ borderColor: hexToRgba(colors.text, 0.15) }}
          >
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Amount
              </ThemedText>
              <ThemedText>₦{hosting?.price.toLocaleString()}</ThemedText>
            </View>
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Discount
              </ThemedText>
              <ThemedText>₦0</ThemedText>
            </View>
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Service Fee
              </ThemedText>
              <ThemedText>₦0</ThemedText>
            </View>
          </View>
        </View>
        <Button type="primary">
          <ThemedText content="primary">Continue</ThemedText>
        </Button>
      </View>
    </DetailsLayout>
  );
}
