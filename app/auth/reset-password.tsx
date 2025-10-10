import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import AuthLayout from "@/components/layouts/auth";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function ResetPassword() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Reset Password"
      description="Enter and set up a new password"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <FloatingLabelInput
            secureTextEntry
            inputMode="text"
            autoComplete="password"
            placeholder="**********"
            label="New Password"
          />
          <FloatingLabelInput
            secureTextEntry
            inputMode="text"
            autoComplete="password"
            placeholder="**********"
            label="Confirm Password"
          />
          <Button
            onPress={() => router.push("/auth/otp-verification")}
            type="primary"
          >
            <ThemedText content="primary">Set New Password</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
