import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  style?: StyleProp<ViewStyle>;
  /** Peak opacity of the tint at the centre of the gradient. */
  intensity?: number;
};

/**
 * A faint horizontal gradient divider (transparent → tint → transparent) — the
 * soft/cloudy replacement for a hard 1px rule. It blends sections instead of
 * boxing them in (see [[reference_design_system_soft_cloudy]]). Tinted with the
 * theme text colour so it adapts to light + dark.
 */
const Hairline: React.FC<Props> = ({ style, intensity = 0.08 }) => {
  const colors = useThemeColors();
  return (
    <LinearGradient
      colors={[
        hexToRgba(colors.text, 0),
        hexToRgba(colors.text, intensity),
        hexToRgba(colors.text, 0),
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      pointerEvents="none"
      style={[{ height: 1, width: '100%' }, style]}
    />
  );
};

export default Hairline;
