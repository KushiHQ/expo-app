import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { TextInput, View } from 'react-native';
import { LineiconsSearch1 } from '../icons/i-search';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

const SearchInput: React.FC<Props> = ({ value, onChangeText, placeholder }) => {
  const colors = useThemeColors();

  return (
    <View
      className="h-12 flex-row items-center gap-2.5 rounded-2xl px-4"
      style={{
        backgroundColor: colors['surface-01'],
        borderWidth: 1,
        borderColor: hexToRgba(colors.text, 0.05),
      }}
    >
      <LineiconsSearch1 size={18} color={hexToRgba(colors.text, 0.4)} />
      <TextInput
        value={value}
        cursorColor={colors.primary}
        className="flex-1"
        onChangeText={onChangeText}
        placeholderTextColor={hexToRgba(colors.text, 0.2)}
        style={{
          fontSize: 16,
          color: colors.text,
        }}
        placeholder={placeholder}
      />
    </View>
  );
};

export default SearchInput;
