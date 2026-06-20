import BankLogo from '@/components/atoms/a-bank-logo';
import { View } from 'react-native';
import { SelectionDetails } from './m-select-input';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedText from '../atoms/a-themed-text';
import { HostPaymentDetailsQuery } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import Checkbox from '../atoms/a-checkbox';
import { getBankLogoUrl } from '@/lib/utils/bank-logos';

type Props = HostPaymentDetailsQuery['hostPaymentDetails'][number] & SelectionDetails;

const PaymentDetailsSelectOption: React.FC<Props> = ({ selected, ...details }) => {
  const colors = useThemeColors();
  const logoUrl = getBankLogoUrl({
    imageUrl: details.bankDetails?.image,
    slug: details.bankDetails?.slug,
  });

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <BankLogo
          borderColor={hexToRgba(colors.primary, 0.5)}
          name={details.bankDetails?.name}
          uri={logoUrl}
        />
        <View>
          <ThemedText style={{ fontSize: 14 }}>{details.accountName ?? 'Account Name'}</ThemedText>
          <ThemedText style={{ fontSize: 12 }}>
            {details.accountNumber} {details.bankDetails?.name}
          </ThemedText>
        </View>
      </View>
      <Checkbox
        color={selected ? colors.primary : hexToRgba(colors.text, 0.6)}
        checked={selected}
      />
    </View>
  );
};

export default PaymentDetailsSelectOption;
