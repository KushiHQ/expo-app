import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import AuthLayout from "@/components/layouts/auth";
import { View } from "react-native";

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Don’t worry it occurs. Please provide your email address linked with your account"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <FloatingLabelInput
            focused
            inputMode="email"
            autoComplete="email"
            placeholder="@gmail.com"
            label="Email"
          />
          <Button type="primary">
            <ThemedText content="primary">Continue</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
