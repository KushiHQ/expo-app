import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import DetailsLayout from '@/components/layouts/details';
import ThemedText from '@/components/atoms/a-themed-text';
import Button from '@/components/atoms/a-button';
import PhoneInput, { ICountry, IPhoneInputRef } from 'react-native-international-phone-number';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { CircleQuestionMark } from 'lucide-react-native';
import {
  useInitiatePhoneNumberVerificationMutation,
  useCompletePhoneNumberVerificationMutation,
} from '@/lib/services/graphql/generated';
import Toast from 'react-native-toast-message';
import LoadingModal from '@/components/atoms/a-loading-modal';
import OTPInput from '@/components/atoms/a-otp-input';
import { handleError } from '@/lib/utils/error';
import { useUser } from '@/lib/hooks/user';

export default function PhoneVerification() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user, updateUser } = useUser();
  const [input, setInput] = React.useState('');
  const [country, setCountry] = React.useState<ICountry>();
  const [otp, setOtp] = React.useState('');
  const [otpRequested, setOtpRequested] = React.useState(false);
  const phoneInputRef = React.useRef<IPhoneInputRef>(null);

  const [{ fetching: initiating, error: initiationError }, initiateVerification] =
    useInitiatePhoneNumberVerificationMutation();

  const [{ fetching: completing, error: complectionError }, completeVerification] =
    useCompletePhoneNumberVerificationMutation();

  const formatedNumber = React.useMemo(() => {
    const str = input.replaceAll(' ', '').replace(/^0+/, '');
    return `${country?.idd.root ?? '+234'}${str}`;
  }, [input, country]);

  const loading = initiating || completing;

  React.useEffect(() => {
    if (initiationError) {
      handleError(initiationError);
    } else if (complectionError) {
      handleError(complectionError);
    }
  }, [initiationError, complectionError]);

  const handleInitiate = () => {
    if (!input) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid phone number',
      });
      return;
    }
    initiateVerification({ phoneNumber: formatedNumber }).then((res) => {
      if (res.data?.initiatePhoneNumberVerification) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.initiatePhoneNumberVerification.message,
        });
        setOtpRequested(true);
      }
    });
  };

  const handleComplete = () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 6-digit OTP',
      });
      return;
    }
    completeVerification({
      input: { phoneNumber: formatedNumber, otp },
    }).then((res) => {
      if (res.data?.completePhoneNumberVerification) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Phone number verified successfully',
        });
        // Update local user state
        // Update local user state
        if (user.user) {
          const updatedPhoneNumbers = [
            ...(user.user.phoneNumbers ?? []),
            {
              id: res.data?.completePhoneNumberVerification.data?.id ?? '',
              number: formatedNumber,
              verificationStatus: 'VERIFIED' as any,
            },
          ];
          updateUser({
            user: {
              ...user.user,
              phoneNumbers: updatedPhoneNumbers as any,
            },
          });
        }
        router.replace('/kyc');
      }
    });
  };

  return (
    <DetailsLayout title="Phone Verification">
      <View className="mt-4 gap-8 p-6">
        <View className="gap-2">
          <ThemedText type="subtitle">Verify your phone number</ThemedText>
          <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}>
            <CircleQuestionMark color={hexToRgba(colors.text, 0.6)} size={14} />
            {'  '}
            We will send a 6-digit code to your phone number for verification.
          </ThemedText>
        </View>

        <View className="gap-4">
          <ThemedText style={{ fontSize: 14, opacity: 0.8 }}>Phone Number</ThemedText>
          <View
            style={{
              borderWidth: 1,
              borderColor: hexToRgba(colors.text, 0.1),
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <PhoneInput
              placeholderTextColor={hexToRgba(colors.text, 0.5)}
              modalSearchInputPlaceholderTextColor={hexToRgba(colors.text, 0.5)}
              cursorColor={colors.primary}
              modalStyles={{
                backdrop: { backgroundColor: hexToRgba(colors.text, 0.1) },
                content: { backgroundColor: colors.background },
                countryItem: { backgroundColor: colors.background },
                dragHandleIndicator: {
                  backgroundColor: hexToRgba(colors.text, 0.7),
                },
                flag: { color: colors.text },
                callingCode: { color: colors.text },
                searchInput: { color: colors.text },
                countryName: { color: colors.text },
                sectionTitle: { color: colors.text },
                closeButtonText: { color: colors.text },
                countryNotFoundMessage: { color: colors.text },
                alphabetLetterText: { color: colors.text },
              }}
              phoneInputStyles={{
                container: {
                  backgroundColor: colors.background,
                  borderColor: 'transparent',
                  height: 56,
                  borderRadius: 12,
                },
                flagContainer: { backgroundColor: colors.background },
                callingCode: { color: colors.text },
                input: { color: colors.text },
              }}
              ref={phoneInputRef}
              value={input}
              onChangeSelectedCountry={setCountry}
              defaultCountry="NG"
              onChangePhoneNumber={setInput}
              disabled={otpRequested}
            />
          </View>
        </View>

        {otpRequested && (
          <View className="items-center gap-4">
            <ThemedText style={{ fontSize: 14, opacity: 0.8 }} className="self-start">
              Enter 6-digit OTP
            </ThemedText>
            <OTPInput length={6} value={otp} onChangeText={setOtp} />
            <Button variant="outline" onPress={() => setOtpRequested(false)} className="mt-2">
              <ThemedText style={{ color: colors.primary, fontSize: 12 }}>
                Change phone number
              </ThemedText>
            </Button>
          </View>
        )}

        <Button
          onPress={otpRequested ? handleComplete : handleInitiate}
          type="primary"
          className="mt-4 py-[18px]"
          disabled={loading}
        >
          <ThemedText content="primary">
            {otpRequested ? 'Verify OTP' : 'Send Verification Code'}
          </ThemedText>
        </Button>
      </View>
      <LoadingModal visible={loading} />
    </DetailsLayout>
  );
}
