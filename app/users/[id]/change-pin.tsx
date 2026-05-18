import Button from '@/components/atoms/a-button';
import OTPInput from '@/components/atoms/a-otp-input';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function UserUpdatePin() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <DetailsLayout title="Update PIN">
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <View className="mb-4 gap-4">
            <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 28 }} type="title">
              Update PIN
            </ThemedText>
            <ThemedText style={{ color: hexToRgba(colors['text'], 0.7) }}>
              Provide your previous pin and add a new pin to update your password successfully
            </ThemedText>
          </View>
          <View className="gap-6">
            <View className="gap-3">
              <ThemedText type="semibold">Old PIN</ThemedText>
              <OTPInput secureTextEntry length={4} />
            </View>
            <View className="gap-3">
              <ThemedText type="semibold">New PIN</ThemedText>
              <OTPInput secureTextEntry length={4} />
            </View>
            <View className="gap-3">
              <ThemedText type="semibold">Confirm PIN</ThemedText>
              <OTPInput secureTextEntry length={4} />
            </View>
          </View>
          <Button type="primary">
            <ThemedText content="primary">Update</ThemedText>
          </Button>
          <Button onPress={() => router.push('/auth/forgot-password')}>
            <ThemedText content="tinted">Forgot Password</ThemedText>
          </Button>
        </View>
      </View>
    </DetailsLayout>
  );
}
