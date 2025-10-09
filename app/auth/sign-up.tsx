import Button from "@/components/atoms/a-button";
import Centered from "@/components/atoms/a-centered";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { LogosApple, LogosGoogle } from "@/components/icons/i-logos";
import AuthLayout from "@/components/layouts/auth";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Link } from "expo-router";
import { View } from "react-native";

export default function SignUp() {
  const colors = useThemeColors();

  return (
    <AuthLayout
      title="Create Account"
      description="Sign up easily with your email or social accounts"
    >
      <View className="mt-10 flex-1 justify-between">
        <View className="gap-4">
          <FloatingLabelInput
            focused
            inputMode="text"
            autoComplete="name"
            placeholder="Enter your name"
            label="Full Name"
          />
          <FloatingLabelInput
            focused
            inputMode="email"
            autoComplete="email"
            placeholder="@gmail.com"
            label="Email"
          />
          <FloatingLabelInput
            focused
            inputMode="tel"
            autoComplete="tel"
            placeholder="+234 901 345 9878"
            label="Phone Number"
          />
          <FloatingLabelInput
            secureTextEntry
            inputMode="text"
            autoComplete="password"
            placeholder="**********"
            label="Password"
          />
          <Button type="primary">
            <ThemedText content="primary">Sign Up</ThemedText>
          </Button>
          <Centered className="mt-1">
            <ThemedText>or</ThemedText>
          </Centered>
          <View className="items-center flex-row justify-center gap-8">
            <View
              style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
              className="w-9 h-9 items-center justify-center rounded-full p-1"
            >
              <LogosGoogle />
            </View>
            <View
              style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
              className="w-9 h-9 items-center justify-center rounded-full p-1"
            >
              <LogosApple />
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-center mt-20 gap-1">
          <ThemedText>Already a member?</ThemedText>
          <Link href="/auth/sign-up">
            <ThemedText content="tinted" className="underline">
              Log in
            </ThemedText>
          </Link>
        </View>
      </View>
    </AuthLayout>
  );
}
