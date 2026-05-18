import Button from '@/components/atoms/a-button';
import OTPInput from '@/components/atoms/a-otp-input';
import ThemedText from '@/components/atoms/a-themed-text';
import AuthLayout from '@/components/layouts/auth';
import useCountdown from '@/lib/hooks/use-countdown';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  Otpinput,
  useResendEmailVerificationOtpMutation,
  useVerifyEmailMutation,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { formatSeconds } from '@/lib/utils/time';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function OTPVerification() {
  const router = useRouter();
  const colors = useThemeColors();
  const { email } = useLocalSearchParams();
  const { reset, count } = useCountdown(0);
  const [inputs, setInputs] = React.useState<Partial<Otpinput>>({
    email: cast(email),
  });
  const [res, mutate] = useVerifyEmailMutation();
  const [resendOtp, mutateResend] = useResendEmailVerificationOtpMutation();

  const handlePress = () => {
    mutate({ input: cast(inputs) }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.verifyEmail.message,
        });
        router.replace(`/auth/sign-in?email=${inputs.email}`);
      }
    });
  };

  const handleResend = () => {
    reset(60 * 2);
    mutateResend({ email: cast(inputs.email) }).then((res) => {
      if (res.error) {
        Toast.show({
          type: 'error',
          text1: res.error.name,
          text2: res.error.message,
        });
      }
      if (res.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.resendEmailVerificationOtp.message,
        });
      }
    });
  };

  return (
    <AuthLayout
      title="Enter Your OTP"
      description="Check your email or phone number and copy the OTP sent to you now"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <OTPInput length={6} onChangeText={(v) => setInputs((c) => ({ ...c, otp: v }))} />
          <View className="my-2 flex-row items-center justify-between">
            <ThemedText style={{ color: colors['accent'] }}>
              {count > 0 ? `Time Remaining ${formatSeconds(count)} ` : ''}
            </ThemedText>
            <Pressable
              className="disabled:opacity-70"
              disabled={count > 0 || resendOtp.fetching}
              onPress={handleResend}
            >
              <ThemedText content="tinted">Resend OTP</ThemedText>
            </Pressable>
          </View>
          <Button
            onPress={handlePress}
            loading={res.fetching}
            type="primary"
            disabled={res.fetching || inputs.otp?.length !== 6 || !inputs.email?.length}
          >
            <ThemedText content="primary">Continue</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
