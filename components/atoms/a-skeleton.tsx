import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React, { FC, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps {
  children?: ReactNode;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

const Skeleton: FC<SkeletonProps> = ({
  children,
  duration = 1000,
  minOpacity = 0.3,
  maxOpacity = 0.7,
  style,
}) => {
  const colors = useThemeColors();
  const animatedOpacity = useSharedValue(minOpacity);

  React.useEffect(() => {
    animatedOpacity.value = withRepeat(
      withTiming(maxOpacity, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [animatedOpacity, duration, minOpacity, maxOpacity]);

  const rStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        { backgroundColor: hexToRgba(colors.text, 0.4), borderRadius: 4 },
        style,
        rStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default Skeleton;
