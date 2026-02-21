import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Portal } from "react-native-paper";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { scheduleOnRN } from "react-native-worklets";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TooltipProps {
  title?: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  title,
  className,
  description,
  children,
}) => {
  const colors = useThemeColors();
  const triggerRef = useRef<View>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const animation = useSharedValue(0);

  const openTooltip = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setCoords({ x, y, width, height });
      setIsVisible(true);

      animation.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
    });
  };

  const closeTooltip = () => {
    animation.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        scheduleOnRN(setIsVisible, false);
      }
    });
  };

  const TOOLTIP_WIDTH = 220;
  const tooltipX = coords.x + coords.width / 2 - TOOLTIP_WIDTH / 2;
  const safeX = Math.max(
    10,
    Math.min(tooltipX, SCREEN_WIDTH - TOOLTIP_WIDTH - 10),
  );
  const tooltipY = coords.y + 25;

  const rTooltipStyle = useAnimatedStyle(() => {
    return {
      opacity: animation.value,
      transform: [
        { scale: animation.value },
        { translateY: (1 - animation.value) * 20 },
      ],
    };
  });

  return (
    <>
      <Pressable onPress={openTooltip} hitSlop={10} className={className}>
        <View ref={triggerRef} collapsable={false}>
          {children}
        </View>
      </Pressable>

      {isVisible && (
        <Portal>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closeTooltip}
          >
            <Animated.View
              style={[
                styles.tooltipBubble,
                {
                  backgroundColor: colors.text,
                  left: safeX,
                  bottom: SCREEN_HEIGHT - tooltipY,
                },
                rTooltipStyle,
              ]}
            >
              {title && (
                <ThemedText
                  type="semibold"
                  style={[styles.title, { color: colors.background }]}
                >
                  {title}
                </ThemedText>
              )}
              <ThemedText
                style={[
                  styles.description,
                  { color: hexToRgba(colors.background, 0.9) },
                ]}
              >
                {description}
              </ThemedText>

              <View
                style={[
                  styles.arrow,
                  {
                    backgroundColor: colors.text,
                    left: coords.x - safeX + coords.width / 2 - 6,
                  },
                ]}
              />
            </Animated.View>
          </Pressable>
        </Portal>
      )}
    </>
  );
};

export default Tooltip;

const styles = StyleSheet.create({
  tooltipBubble: {
    position: "absolute",
    width: 220,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    position: "absolute",
    bottom: -5,
    width: 12,
    height: 12,
    transform: [{ rotate: "45deg" }],
  },
});
