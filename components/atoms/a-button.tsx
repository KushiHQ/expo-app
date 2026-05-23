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
  View,
  ViewStyle,
} from 'react-native';

type BaseProps = Omit<PressableProps, 'style'>;
type Props = BaseProps & {
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  variant?: 'outline' | 'solid';
  type?: 'primary' | 'shade' | 'tinted' | 'background' | 'error' | 'text';
};

const Button: React.FC<Props> = ({ style, children, loading, variant, type, onPress, ...rest }) => {
  const colors = useThemeColors();

  const handlePress = (event: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const color =
    type === 'primary'
      ? colors['primary-content']
      : type === 'shade'
        ? colors['shade-content']
        : type === 'error'
          ? '#fff'
          : type === 'text'
            ? colors.background
            : colors.text;

  const isSolid = variant !== 'outline';
  const isPrimary = type === 'primary' && isSolid;
  const isError = type === 'error' && isSolid;
  const showHighlight = isSolid && !!type && type !== 'text';

  return (
    <Pressable
      style={[
        styles.button,
        variant === 'outline'
          ? {
              borderWidth: 1.5,
              borderColor:
                type === 'primary'
                  ? colors.primary
                  : type === 'shade'
                    ? colors.shade
                    : type === 'background'
                      ? colors.background
                      : type === 'text'
                        ? colors.text
                        : type === 'error'
                          ? colors.error
                          : hexToRgba(colors.primary, 0.2),
            }
          : type && {
              backgroundColor:
                type === 'primary'
                  ? colors.primary
                  : type === 'shade'
                    ? colors.shade
                    : type === 'background'
                      ? colors.background
                      : type === 'text'
                        ? colors.text
                        : type === 'error'
                          ? colors.error
                          : hexToRgba(colors.primary, 0.2),
            },
        isPrimary && styles.primaryShadow,
        isError && styles.errorShadow,
        style,
        rest.disabled && styles.disabled,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {showHighlight && <View style={styles.innerHighlight} pointerEvents="none" />}
      {loading ? <ActivityIndicator size="small" color={color} /> : children}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 13,
    borderRadius: 14,
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  primaryShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
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
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: '#EF4444',
      },
    }),
  },
  disabled: {
    opacity: 0.52,
  },
});
