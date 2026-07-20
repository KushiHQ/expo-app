import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import type { SelectionDetails } from './m-select-input';

/** Option shape for the management-type picker (see step-1 hosting form). */
export type ManagementOptionType = {
  label: string;
  value: string;
  description: string;
};

/**
 * Dropdown row for choosing how a listing is managed: title + a one-line
 * explanation of what that choice means, so the host understands the difference.
 */
export const ManagementOption: React.FC<ManagementOptionType & SelectionDetails> = ({
  label,
  description,
  selected,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        gap: 4,
        backgroundColor: selected ? hexToRgba(colors.primary, 0.14) : hexToRgba(colors.text, 0.05),
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <ThemedText style={{ fontSize: 15, fontFamily: Fonts.semibold }}>{label}</ThemedText>
        {selected ? <Check size={18} color={colors.primary} /> : null}
      </View>
      <ThemedText style={{ fontSize: 12, lineHeight: 18, color: hexToRgba(colors.text, 0.55) }}>
        {description}
      </ThemedText>
    </View>
  );
};

export default ManagementOption;
