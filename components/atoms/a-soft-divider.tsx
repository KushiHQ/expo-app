import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  /** Extra layout (margins etc.). */
  style?: ViewStyle;
  /** Line opacity against the text colour (default barely-there). */
  opacity?: number;
};

/**
 * A faint 1px rule for the soft/cloudy language — use instead of hard
 * `border-b`/`border-t` dividers so sections separate without a hard outline.
 */
const SoftDivider: React.FC<Props> = ({ style, opacity = 0.05 }) => {
  const colors = useThemeColors();
  return <View style={[{ height: 1, backgroundColor: hexToRgba(colors.text, opacity) }, style]} />;
};

export default SoftDivider;
