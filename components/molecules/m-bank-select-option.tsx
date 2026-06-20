import BankLogo from '@/components/atoms/a-bank-logo';
import { Bank } from '@/lib/services/graphql/generated';
import { getBankLogoUrl } from '@/lib/utils/bank-logos';
import { View } from 'react-native';
import { SelectionDetails } from './m-select-input';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import ThemedText from '../atoms/a-themed-text';
import Checkbox from '../atoms/a-checkbox';
import { hexToRgba } from '@/lib/utils/colors';

type Props = Bank & SelectionDetails;

const BankSelectOption: React.FC<Props> = ({ selected, ...bank }) => {
  const colors = useThemeColors();
  const logoUrl = getBankLogoUrl({
    imageUrl: bank.image,
    slug: bank.slug,
  });

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <BankLogo borderColor={colors.primary} contentFit="cover" name={bank.name} uri={logoUrl} />
        <ThemedText>{bank.name}</ThemedText>
      </View>
      <Checkbox
        color={selected ? colors.primary : hexToRgba(colors.text, 0.6)}
        checked={selected}
      />
    </View>
  );
};

export default BankSelectOption;
