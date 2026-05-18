import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function UserUpdatePassword() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <DetailsLayout title="Update Password">
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <View className="mb-4 gap-4">
            <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 28 }} type="title">
              Update Password
            </ThemedText>
            <ThemedText style={{ color: hexToRgba(colors['text'], 0.7) }}>
              Provide your previous password and add a new password to update your password
              successfully
            </ThemedText>
          </View>
          <FloatingLabelInput
            secureTextEntry
            inputMode="text"
            autoComplete="password"
            placeholder="**********"
            label="Previous Password"
          />
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
