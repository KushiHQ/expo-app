import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
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

  // Resolve the container fill up-front as a plain style object (classic RN
  // props only — no boxShadow string) so the background always paints.
  const containerStyle: ViewStyle =
    variant === 'outline'
      ? // Borderless soft/outline variants — a translucent wash of the type
        // colour, no hard outline (soft/cloudy rule). `soft` reads stronger.
        { backgroundColor: hexToRgba(typeColor, 0.1) }
      : variant === 'soft'
        ? { backgroundColor: hexToRgba(typeColor, 0.16) }
        : variant === 'text'
          ? {
              backgroundColor: 'transparent',
              paddingVertical: 0,
              paddingHorizontal: 0,
              alignItems: 'flex-start',
            }
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
  // Warm glow on the primary CTA — Platform.select (proven to paint on both
  // platforms) rather than a boxShadow string.
  primaryShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
        shadowColor: '#F59E0B',
      },
    }),
  },
  errorShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
        shadowColor: '#EF4444',
      },
    }),
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
