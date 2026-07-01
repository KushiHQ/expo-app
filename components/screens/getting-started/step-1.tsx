import Button from '@/components/atoms/a-button';
import Checkbox from '@/components/atoms/a-checkbox';
import ThemedText from '@/components/atoms/a-themed-text';
import { BusinessDealHandshake } from '@/components/icons/i-business-deal-handshake';
import { CashPaymentBag } from '@/components/icons/i-payments';
import { SURFACE } from '@/lib/constants/surface';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { UserType } from '@/lib/types/users';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View } from 'react-native';

type Props = {
  onNext?: () => void;
};

const GettingStartedStep1: React.FC<Props> = ({ onNext }) => {
  const colors = useThemeColors();
  const { user, updateUser } = useUser();

  return (
    <View>
      <View className="gap-2">
        <ThemedText type="semibold">What brings you to Kushi?</ThemedText>
        <ThemedText>Select your purpose to get a tailored experience</ThemedText>
      </View>
      <View className="mt-16 gap-4">
        <View
          className="gap-4 rounded-xl p-5"
          style={{
            backgroundColor: hexToRgba(colors.text, 0.05),
            boxShadow: SURFACE.shadow,
          }}
        >
          <CashPaymentBag color={colors['primary']} size={36} />
          <View className="flex-row items-center justify-between">
            <ThemedText>I&apos;m looking for a house</ThemedText>
            <Checkbox
              checked={user.userType === UserType.Guest}
              color={colors['primary']}
              size={24}
              onValueChange={() => {
                if (user.userType !== UserType.Guest) {
                  updateUser({ userType: UserType.Guest });
                } else {
                  updateUser({ userType: undefined });
                }
              }}
            />
          </View>
        </View>
        <View
          className="gap-4 rounded-xl p-5"
          style={{
            backgroundColor: hexToRgba(colors.text, 0.05),
            boxShadow: SURFACE.shadow,
          }}
        >
          <BusinessDealHandshake color={colors['primary']} size={48} />
          <View className="flex-row items-center justify-between">
            <ThemedText>I want to rent out my house</ThemedText>
            <Checkbox
              checked={user.userType === UserType.Host}
              color={colors['primary']}
              size={28}
              onValueChange={() => {
                if (user.userType !== UserType.Host) {
                  updateUser({ userType: UserType.Host });
                } else {
                  updateUser({ userType: undefined });
                }
              }}
            />
          </View>
        </View>
      </View>
      <Button
        onPress={onNext}
        disabled={user.userType === undefined}
        type="primary"
        className="mt-8"
      >
        <ThemedText content="primary">Continue</ThemedText>
      </Button>
    </View>
  );
};

export default GettingStartedStep1;
