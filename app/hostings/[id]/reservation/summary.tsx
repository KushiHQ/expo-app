import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { StreamlineUltimateReceipt } from "@/components/icons/i-receipt";
import DetailsLayout from "@/components/layouts/details";
import BiometricsVerification from "@/components/molecules/m-biometriecs-verification";
import HostingSummaryCard from "@/components/molecules/m-hosting-summary-card";
import PinVerification from "@/components/molecules/m-pin-verifcation";
import SuccessModal from "@/components/organisms/o-success-modal";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { View } from "react-native";

export default function ReservationSummary() {
  const [biometricsOpen, setBiometricsOpen] = React.useState(false);
  const [pinOpen, setPinOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const hostings = useAtomValue(hostingsAtom);
  const hosting = hostings.find((hosting) => hosting.id === id);

  const handleSuccess = () => {
    setPinOpen(false);
    setBiometricsOpen(false);
    setSuccess(true);
  };

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
            <View
              className="flex-row pb-4 border-b items-center justify-between"
              style={{ borderColor: hexToRgba(colors.text, 0.1) }}
            >
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Service Fee
              </ThemedText>
              <ThemedText>₦0</ThemedText>
            </View>
            <View className="flex-row pb-2 items-center justify-between">
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
                Total
              </ThemedText>
              <ThemedText
                style={{
                  fontFamily: Fonts.bold,
                  color: colors.primary,
                  fontSize: 20,
                }}
              >
                ₦{hosting?.price.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>
        <Button onPress={() => setBiometricsOpen(true)} type="primary">
          <ThemedText content="primary">Continue</ThemedText>
        </Button>
      </View>
      <BiometricsVerification
        open={biometricsOpen}
        onCancel={() => setBiometricsOpen(false)}
        onSuccess={handleSuccess}
        onUsePin={() => {
          setBiometricsOpen(false);
          setPinOpen(true);
        }}
        onError={() => setBiometricsOpen(false)}
      />
      <PinVerification
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onSuccess={handleSuccess}
        onError={() => setPinOpen(false)}
      />
      <SuccessModal
        open={success}
        onClose={() => setSuccess(false)}
        title="Payment Successful"
        description={`Your "${hosting?.title}" is booked! Access the booking ticket on your profile >> My Bookings  or view it right away.`}
        action={
          <Button type="primary" className="w-60">
            <View className="flex-row gap-2 items-center">
              <StreamlineUltimateReceipt
                size={18}
                color={colors["primary-content"]}
              />
              <ThemedText content="primary">View E-Recipet</ThemedText>
            </View>
          </Button>
        }
      />
    </DetailsLayout>
  );
}
