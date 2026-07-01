import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

const TextArea: React.FC<TextInputProps> = (props) => {
  const colors = useThemeColors();
  return (
    <View
      className="h-32 rounded-xl p-2 pt-0"
      style={{
        backgroundColor: hexToRgba(colors['text'], 0.05),
        boxShadow: SURFACE.shadow,
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
