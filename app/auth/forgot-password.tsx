import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import ThemedText from '@/components/atoms/a-themed-text';
import AuthLayout from '@/components/layouts/auth';
import {
  RequestPasswordChangeInput,
  useRequestPasswordChangeMutation,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ForgotPassword() {
  const router = useRouter();
  const [inputs, setInputs] = React.useState<Partial<RequestPasswordChangeInput>>({});
  const [res, mutate] = useRequestPasswordChangeMutation();

  const handlePress = () => {
    mutate({ input: cast(inputs) }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.requestPasswordChange.message,
        });
        router.replace(`/auth/reset-password?email=${inputs.email}`);
      }
    });
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Don’t worry it occurs. Please provide your email address linked with your account"
    >
      <View className="mt-10 h-full flex-1 justify-between">
        <View className="gap-4">
          <View className="min-h-[70px]">
            <FloatingLabelInput
              focused
              inputMode="email"
              autoComplete="email"
              placeholder="@gmail.com"
              label="Email"
              onChangeText={(v) => setInputs((c) => ({ ...c, email: v }))}
            />
          </View>
          <Button
            onPress={() => handlePress()}
            type="primary"
            loading={res.fetching}
            disabled={res.fetching || !inputs.email?.length}
          >
            <ThemedText content="primary">Continue</ThemedText>
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
