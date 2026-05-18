import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import OTPInput from '@/components/atoms/a-otp-input';
import ThemedText from '@/components/atoms/a-themed-text';
import AuthLayout from '@/components/layouts/auth';
import { Fonts } from '@/lib/constants/theme';
import {
  CompletePasswordChangeInput,
  useCompletePasswordChangeMutation,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [inputs, setInputs] = React.useState<Partial<CompletePasswordChangeInput>>({
    email: cast(email),
  });
  const [res, mutate] = useCompletePasswordChangeMutation();

  const handlePress = () => {
    mutate({ input: cast(inputs) }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.completePasswordChange.message,
        });
        router.replace(`/auth/sign-in?email=${inputs.email}`);
      }
    });
  };

  return (
    <AuthLayout title="Reset Password" description="Enter and set up a new password">
      <View className="mt-10 flex-1">
        <View className="min-h-[500px] gap-4">
          <View className="mb-4 gap-4">
            <View className="gap-2">
              <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>OTP</ThemedText>
              <OTPInput length={6} onChangeText={(v) => setInputs((c) => ({ ...c, otp: v }))} />
            </View>
            <View className="gap-4">
              <FloatingLabelInput
                secureTextEntry
                inputMode="text"
                autoComplete="password"
                placeholder="**********"
                label="New Password"
                onChangeText={(v) => setInputs((c) => ({ ...c, password1: v }))}
              />
              <FloatingLabelInput
                secureTextEntry
                inputMode="text"
                autoComplete="password"
                placeholder="**********"
                label="Confirm Password"
                onChangeText={(v) => setInputs((c) => ({ ...c, password2: v }))}
              />
            </View>
          </View>
          <Button
            onPress={handlePress}
            type="primary"
            loading={res.fetching}
            disabled={
              res.fetching ||
              !inputs.email?.length ||
              !inputs.otp?.length ||
              !inputs.password1?.length ||
              !inputs.password2?.length
            }
          >
            <ThemedText content="primary">Set New Password</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
