import Button from "@/components/atoms/a-button";
import Centered from "@/components/atoms/a-centered";
import Checkbox from "@/components/atoms/a-checkbox";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { LogosApple, LogosGoogle } from "@/components/icons/i-logos";
import AuthLayout from "@/components/layouts/auth";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Link } from "expo-router";
import { View } from "react-native";

export default function Login() {
  const colors = useThemeColors();

  return (
    <AuthLayout
      title="Sign In"
      description="Sign in easily with your email or social accounts"
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
          <FloatingLabelInput
            secureTextEntry
            inputMode="text"
            autoComplete="password"
            placeholder="**********"
            label="Password"
          />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Checkbox color={colors["primary"]} />
              <ThemedText>Remeber Password</ThemedText>
            </View>
            <Link href="/auth/forgot-password">
              <ThemedText>Forgot password?</ThemedText>
            </Link>
          </View>
          <Button type="primary">
            <ThemedText content="primary">Sign In</ThemedText>
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
              Sign up
            </ThemedText>
          </Link>
        </View>
      </View>
    </AuthLayout>
  );
}
