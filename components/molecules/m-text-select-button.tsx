import { Pressable } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import React from 'react';
import { CarbonCircleFilled, CarbonCircleOutline } from '../icons/i-circle';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  value: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
};

const TextSelectButton: React.FC<Props> = ({ value, selected, onSelect }) => {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => onSelect?.(value)}
      className="flex-1 flex-row items-center justify-between rounded-xl p-3"
      style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
    >
      <ThemedText>{value}</ThemedText>

      {selected ? (
        <CarbonCircleFilled size={16} color={colors.primary} />
      ) : (
        <CarbonCircleOutline size={16} color={colors.primary} />
      )}
    </Pressable>
  );
};

export default TextSelectButton;
