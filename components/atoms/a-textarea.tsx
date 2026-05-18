import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

const TextArea: React.FC<TextInputProps> = (props) => {
  const colors = useThemeColors();
  return (
    <View
      className="h-32 rounded-xl border p-2 pt-0"
      style={{
        borderColor: hexToRgba(colors['text'], 0.15),
        borderWidth: 1.5,
        backgroundColor: hexToRgba(colors['text'], 0.055),
      }}
    >
      <TextInput
        multiline
        style={{ color: colors.text, fontSize: 15 }}
        placeholderTextColor={hexToRgba(colors['text'], 0.5)}
        numberOfLines={6}
        {...props}
      />
    </View>
  );
};

export default TextArea;
