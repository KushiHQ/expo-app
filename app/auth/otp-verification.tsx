import Button from "@/components/atoms/a-button";
import OTPInput from "@/components/atoms/a-otp-input";
import ThemedText from "@/components/atoms/a-themed-text";
import AuthLayout from "@/components/layouts/auth";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function OTPVerification() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Enter Your OTP"
      description="Check your email or phone number and copy the OTP sent to you now"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <OTPInput length={6} />
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
