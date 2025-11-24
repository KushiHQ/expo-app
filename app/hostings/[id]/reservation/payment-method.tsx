import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { SolarCardBold } from "@/components/icons/i-card";
import {
  IcSharpApple,
  LogosGoogle,
  MingcutePaypalLine,
} from "@/components/icons/i-logos";
import DetailsLayout from "@/components/layouts/details";
import PaymentMethodItem from "@/components/molecules/m-payment-method-item";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function ReservationPaymentMethod() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const [method, setMethod] = React.useState<
    "card" | "google-pay" | "apple-pay" | "paypal"
  >();

  return (
    <DetailsLayout title="Reservation Details">
      <View className="flex-1 gap-4 justify-between">
        <View>
          <View className="mt-8">
            <ThemedText style={{ fontSize: 18, fontFamily: Fonts.bold }}>
              Select Payment Method
            </ThemedText>
          </View>
          <View className="mt-5 gap-5">
            <PaymentMethodItem
              label="Card"
              selected={method === "card"}
              onSelect={() => setMethod("card")}
              icon={<SolarCardBold size={24} color={colors.primary} />}
            />
            <PaymentMethodItem
              label="Google Pay"
              selected={method === "google-pay"}
              onSelect={() => setMethod("google-pay")}
              icon={<LogosGoogle size={24} color={colors.primary} />}
            />
            <PaymentMethodItem
              label="Apple Pay"
              selected={method === "apple-pay"}
              onSelect={() => setMethod("apple-pay")}
              icon={<IcSharpApple size={24} color={colors.primary} />}
            />
            <PaymentMethodItem
              label="Paypal"
              selected={method === "paypal"}
              onSelect={() => setMethod("paypal")}
              icon={<MingcutePaypalLine size={24} color={colors.primary} />}
            />
          </View>
        </View>
        <Button
          onPress={() =>
            router.push(
              `/payment-methods/card?redirect=/hostings/${id}/reservation/summary/`,
            )
          }
          disabled={!method}
          type="primary"
        >
          <ThemedText content="primary">Continue</ThemedText>
        </Button>
      </View>
    </DetailsLayout>
  );
}
