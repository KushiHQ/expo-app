import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type BaseProps = Omit<PressableProps, 'style'>;
type Props = BaseProps & {
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  variant?: 'outline' | 'solid' | 'soft' | 'text';
  type?: 'primary' | 'shade' | 'tinted' | 'background' | 'error' | 'text' | 'accent';
};

const Button: React.FC<Props> = ({
  style,
  children,
  loading,
  variant,
  type,
  onPress,
  disabled,
  ...rest
}) => {
  const colors = useThemeColors();
  // A disabled OR loading button must not register taps (and must not buzz).
  const isDisabled = !!disabled || !!loading;

  const handlePress = (event: GestureResponderEvent) => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const typeColor =
    type === 'primary'
      ? colors.primary
      : type === 'shade'
        ? colors.shade
        : type === 'accent'
          ? colors.accent
          : type === 'background'
            ? colors.background
            : type === 'text'
              ? colors.text
              : type === 'error'
                ? colors.error
                : hexToRgba(colors.primary, 0.2);

  const color =
    type === 'primary'
      ? colors['primary-content']
      : type === 'shade'
        ? colors['shade-content']
        : type === 'error' || type === 'accent'
          ? '#fff'
          : type === 'text'
            ? colors.background
            : colors.text;

  const isSolid = variant !== 'outline' && variant !== 'soft' && variant !== 'text';
  const isPrimary = type === 'primary' && isSolid;
  const isError = type === 'error' && isSolid;

  // Soft-filled spinner adopts the accent colour; solid uses the content colour.
  const spinnerColor = isSolid ? color : typeColor;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        // Borderless soft/outline variants — a translucent wash of the type
        // colour, no hard outline (soft/cloudy rule). `soft` reads a touch
        // stronger than `outline`.
        variant === 'outline'
          ? { backgroundColor: hexToRgba(typeColor, 0.09) }
          : variant === 'soft'
            ? { backgroundColor: hexToRgba(typeColor, 0.14) }
            : variant === 'text'
              ? {
                  backgroundColor: undefined,
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                  alignItems: 'flex-start',
                }
              : type && { backgroundColor: typeColor },
        isPrimary && { boxShadow: SURFACE.ctaGlow },
        isError && { boxShadow: SURFACE.dangerGlow },
        style,
        isDisabled && styles.disabled,
        pressed && !isDisabled && variant !== 'text' && styles.pressed,
        pressed && !isDisabled && variant === 'text' && styles.pressedText,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={spinnerColor} /> : children}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    // Full-pill CTA per the soft/cloudy spec (radii: CTAs = full pills).
    borderRadius: 999,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  pressedText: {
    opacity: 0.6,
  },
});
