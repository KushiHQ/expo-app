import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Portal } from "react-native-paper";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TooltipProps {
  title?: string;
  description: string;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  title,
  className,
  description,
  position = "top",
  children,
}) => {
  const colors = useThemeColors();
  const triggerRef = useRef<View>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [tooltipHeight, setTooltipHeight] = useState(0);

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
        runOnJS(setIsVisible)(false);
      }
    });
  };

  const TOOLTIP_WIDTH = 220;
  const tooltipX = coords.x + coords.width / 2 - TOOLTIP_WIDTH / 2;
  const safeX = Math.max(
    10,
    Math.min(tooltipX, SCREEN_WIDTH - TOOLTIP_WIDTH - 10),
  );

  let tooltipPosStyle: any = {};
  let arrowPosStyle: any = {};

  if (position === "top") {
    tooltipPosStyle = {
      left: safeX,
      bottom: SCREEN_HEIGHT - coords.y + 10,
    };
    arrowPosStyle = {
      bottom: -5,
      left: coords.x - safeX + coords.width / 2 - 6,
    };
  } else if (position === "right") {
    tooltipPosStyle = {
      left: coords.x + coords.width + 12,
      top: coords.y + coords.height / 2 - tooltipHeight / 2 + 55,
    };
    arrowPosStyle = {
      left: -5,
      top: tooltipHeight / 2 - 6,
    };
  } else if (position === "bottom") {
    tooltipPosStyle = {
      left: safeX,
      top: coords.y + coords.height + 12,
    };
    arrowPosStyle = {
      top: -5,
      left: coords.x - safeX + coords.width / 2 - 6,
    };
  } else if (position === "left") {
    tooltipPosStyle = {
      right: SCREEN_WIDTH - coords.x + 12,
      top: coords.y + coords.height / 2 - tooltipHeight / 2,
    };
    arrowPosStyle = {
      right: -5,
      top: tooltipHeight / 2 - 6,
    };
  }

  const rTooltipStyle = useAnimatedStyle(() => {
    const translateY =
      position === "top"
        ? (1 - animation.value) * 10
        : position === "bottom"
          ? -(1 - animation.value) * 10
          : 0;
    const translateX =
      position === "left"
        ? (1 - animation.value) * 10
        : position === "right"
          ? -(1 - animation.value) * 10
          : 0;
    return {
      opacity: animation.value,
      transform: [{ scale: animation.value }, { translateY }, { translateX }],
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
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h && h !== tooltipHeight) {
                  setTooltipHeight(h);
                }
              }}
              style={[
                styles.tooltipBubble,
                { backgroundColor: colors.text },
                tooltipPosStyle,
                rTooltipStyle,
                { transform: [{ translateY: 10 }] },
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
                  { backgroundColor: colors.text },
                  arrowPosStyle,
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
    maxWidth: 220,
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
    width: 12,
    height: 12,
    transform: [{ rotate: "45deg" }],
  },
});
