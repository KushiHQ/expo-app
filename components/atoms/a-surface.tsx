import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { SURFACE } from "@/lib/constants/surface";

type Props = ViewProps & {
  /** Visual lift. "high" is for sheets / hero cards. */
  elevation?: "raised" | "high";
  /** Active/selected wash + warm glow instead of the neutral fill. */
  selected?: boolean;
  /** Force the warm glow (e.g. a featured surface) without the selected wash. */
  glow?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * The borderless "soft / cloudy" surface primitive: a translucent fill + a large
 * soft shadow (+ optional warm glow), no hard border. Use this instead of bordered
 * cards across the app. Background ambient glow lives on the screen; this is the
 * raised element that sits in it.
 */
const Surface: React.FC<Props> = ({
  elevation = "raised",
  selected = false,
  glow = false,
  radius = SURFACE.radius,
  style,
  children,
  ...rest
}) => {
  const colors = useThemeColors();

  const backgroundColor = selected
    ? hexToRgba(colors.primary, SURFACE.fillSelected)
    : hexToRgba(colors.text, elevation === "high" ? SURFACE.fillHigh : SURFACE.fillRaised);

  const boxShadow =
    selected || glow
      ? SURFACE.glow
      : elevation === "high"
        ? SURFACE.shadowHigh
        : SURFACE.shadow;

  // boxShadow is a first-class RN style on the New Architecture (enabled here).
  const surfaceStyle: ViewStyle = { backgroundColor, borderRadius: radius, boxShadow } as ViewStyle;

  return (
    <View style={[surfaceStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export default Surface;
