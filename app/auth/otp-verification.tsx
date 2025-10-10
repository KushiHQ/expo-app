import Button from "@/components/atoms/a-button";
import OTPInput from "@/components/atoms/a-otp-input";
import ThemedText from "@/components/atoms/a-themed-text";
import AuthLayout from "@/components/layouts/auth";
import useCountdown from "@/lib/hooks/use-countdown";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { formatSeconds } from "@/lib/utils/time";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

export default function OTPVerification() {
  const router = useRouter();
  const colors = useThemeColors();
  const { reset, count } = useCountdown(0);

  return (
    <AuthLayout
      title="Enter Your OTP"
      description="Check your email or phone number and copy the OTP sent to you now"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <OTPInput length={6} />
          <View className="flex-row justify-between items-center my-2">
            <ThemedText style={{ color: colors["accent"] }}>
              {count > 0 ? `Time Remaining ${formatSeconds(count)} ` : ""}
            </ThemedText>
            <Pressable
              className="disabled:opacity-70"
              disabled={count > 0}
              onPress={() => reset(60 * 2)}
            >
              <ThemedText content="tinted">Resend OTP</ThemedText>
            </Pressable>
          </View>
          <Button
            onPress={() => router.push("/auth/reset-password")}
            type="primary"
          >
            <ThemedText content="primary">Continue</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
