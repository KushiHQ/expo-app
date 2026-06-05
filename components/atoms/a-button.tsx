import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

type BaseProps = Omit<PressableProps, "style">;
type Props = BaseProps & {
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  variant?: "outline" | "solid" | "soft" | "text";
  type?:
  | "primary"
  | "shade"
  | "tinted"
  | "background"
  | "error"
  | "text"
  | "accent";
};

const Button: React.FC<Props> = ({
  style,
  children,
  loading,
  variant,
  type,
  onPress,
  ...rest
}) => {
  const colors = useThemeColors();

  const handlePress = (event: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const typeColor =
    type === "primary"
      ? colors.primary
      : type === "shade"
        ? colors.shade
        : type === "accent"
          ? colors.accent
          : type === "background"
            ? colors.background
            : type === "text"
              ? colors.text
              : type === "error"
                ? colors.error
                : hexToRgba(colors.primary, 0.2);

  const color =
    type === "primary"
      ? colors["primary-content"]
      : type === "shade"
        ? colors["shade-content"]
        : type === "error" || type === "accent"
          ? "#fff"
          : type === "text"
            ? colors.background
            : colors.text;

  const isSolid = variant !== "outline" && variant !== "soft";
  const isPrimary = type === "primary" && isSolid;
  const isError = type === "error" && isSolid;

  return (
    <Pressable
      style={[
        styles.button,
        variant === "outline"
          ? { borderWidth: 1.5, borderColor: typeColor }
          : variant === "soft"
            ? {
              borderWidth: 1.5,
              borderColor: hexToRgba(typeColor, 0.3),
              backgroundColor: hexToRgba(typeColor, 0.08),
            }
            : variant === "text"
              ? {
                backgroundColor: undefined,
                padding: 0,
                paddingBlock: 0,
                alignItems: "flex-start",
              }
              : type && { backgroundColor: typeColor },
        isPrimary && variant !== "text" && styles.primaryShadow,
        isError && styles.errorShadow,
        style,
        rest.disabled && styles.disabled,
      ]}
      onPress={handlePress}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={color} /> : children}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 13,
    borderRadius: 14,
  },
  primaryShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
        shadowColor: "#F59E0B",
      },
    }),
  },
  errorShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: "#EF4444",
      },
    }),
  },
  disabled: {
    opacity: 0.52,
  },
});
