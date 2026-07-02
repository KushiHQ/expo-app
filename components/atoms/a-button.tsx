import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
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
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const colors = useThemeColors();
  // A disabled OR loading button must not register taps (and must not buzz).
  const isDisabled = !!disabled || !!loading;

  // Track press with state so `style` can stay a plain ARRAY, not a function.
  // NativeWind's interop drops the styles returned by a `style` function on a
  // Pressable, which left this button with no fill — an array applies cleanly.
  const [pressed, setPressed] = React.useState(false);

  const handlePress = (event: GestureResponderEvent) => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    setPressed(true);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    onPressOut?.(event);
  };

  // A SOLID base hex for the type — safe to feed into hexToRgba for the
  // soft/outline washes. (`typeColor` below may itself be an rgba for the
  // no-type default, so never alpha that one.)
  const baseColor =
    type === 'shade'
      ? colors.shade
      : type === 'accent'
        ? colors.accent
        : type === 'background'
          ? colors.background
          : type === 'text'
            ? colors.text
            : type === 'error'
              ? colors.error
              : colors.primary;

  const typeColor = type ? baseColor : hexToRgba(colors.primary, 0.2);

  const color =
    type === 'primary'
      ? colors['primary-content']
      : type === 'shade'
        ? colors['shade-content']
        : type === 'error' || type === 'accent'
          ? '#fff'
          : type === 'text'
            ? colors.background
            : // `tinted` is a secondary CTA: amber label on a soft amber wash.
              type === 'tinted'
              ? colors.primary
              : colors.text;

  // `tinted` is always a translucent wash of the primary colour (never a solid
  // fill) — an iOS-style secondary button. Handled explicitly because otherwise
  // it falls through to the solid `typeColor` and reads as a shadow-less primary.
  const isTinted = type === 'tinted';

  const isSolid = variant !== 'outline' && variant !== 'soft' && variant !== 'text';
  const isPrimary = type === 'primary' && isSolid;
  const isError = type === 'error' && isSolid;

  // Soft-filled spinner adopts the accent colour; solid uses the content colour.
  const spinnerColor = isSolid ? color : baseColor;

  // Resolve the container fill up-front as a plain style object (classic RN
  // props only — no boxShadow string) so the background always paints.
  const containerStyle: ViewStyle =
    variant === 'outline'
      ? // A true outline: a soft tinted hairline border over a barely-there
        // wash. Soft/cloudy forbids HARD borders on surfaces, but an "outline"
        // button is border-defined by name — a low-alpha tinted border reads as
        // soft, not hard. (Without any border it collapsed to a near-invisible
        // 10% wash — effectively styleless on the near-black background, and any
        // caller-supplied `borderColor` was dead for want of a `borderWidth`.)
        {
          backgroundColor: hexToRgba(baseColor, 0.06),
          borderWidth: 1,
          borderColor: hexToRgba(baseColor, 0.4),
        }
      : variant === 'soft'
        ? { backgroundColor: hexToRgba(baseColor, 0.16) }
        : variant === 'text'
          ? {
              backgroundColor: 'transparent',
              paddingVertical: 0,
              paddingHorizontal: 0,
              alignItems: 'flex-start',
            }
          : isTinted
            ? { backgroundColor: hexToRgba(colors.primary, 0.14) }
            : type
              ? { backgroundColor: typeColor }
              : {};

  return (
    <Pressable
      style={[
        styles.button,
        containerStyle,
        isPrimary && styles.primaryShadow,
        isError && styles.errorShadow,
        style,
        isDisabled && styles.disabled,
        pressed && !isDisabled && (variant === 'text' ? styles.pressedText : styles.pressed),
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
  // Warm amber glow on the primary CTA. A COLOURED boxShadow — a dark
  // Platform.select shadow is invisible on the near-black background, so the
  // glow has to be tinted. Safe now that `style` is a plain array.
  primaryShadow: {
    boxShadow: '0px 8px 24px -6px rgba(245,158,11,0.55)',
  },
  errorShadow: {
    boxShadow: '0px 8px 22px -8px rgba(239,68,68,0.5)',
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
