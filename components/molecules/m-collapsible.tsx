import React, { useState } from "react";
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ChevronDown, CircleQuestionMark } from "lucide-react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import ThemedText from "../atoms/a-themed-text";
import Tooltip from "../atoms/a-tooltip";
import Checkbox from "../atoms/a-checkbox";

interface CollapsibleProps {
  title: string;
  outline?: boolean;
  tint?: "primary" | "success" | "default" | "shade";
  withCheckbox?: boolean;
  checked?: boolean;
  checkDisabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  outline = true,
  tint = "default",
  withCheckbox,
  checked,
  checkDisabled,
  onCheckedChange,
  description,
  children,
  defaultExpanded = false,
}) => {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const [hasMounted, setHasMounted] = useState(defaultExpanded);

  const progress = useSharedValue(defaultExpanded ? 1 : 0);
  const contentHeight = useSharedValue(0);

  const toggle = () => {
    const nextState = !expanded;
    setExpanded(nextState);

    if (!hasMounted && nextState) {
      setHasMounted(true);
    } else {
      progress.value = withSpring(nextState ? 1 : 0, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const newHeight = event.nativeEvent.layout.height;
    if (newHeight > 0 && contentHeight.value !== newHeight) {
      contentHeight.value = newHeight;

      if (expanded && progress.value === 0) {
        progress.value = withSpring(1, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
      }
    }
  };

  const rContentStyle = useAnimatedStyle(() => {
    return {
      height: progress.value * contentHeight.value,
      opacity: progress.value === 0 ? 0 : 1,
    };
  });

  const rChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 180}deg` }],
    };
  });

  function getTintColor() {
    return tint === "success"
      ? colors.success
      : tint === "shade"
        ? colors.shade
        : tint === "primary"
          ? colors.primary
          : colors.text;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: outline
            ? hexToRgba(getTintColor(), tint !== "default" ? 0.1 : 0.02)
            : "transparent",
          borderColor: outline
            ? hexToRgba(getTintColor(), tint !== "default" ? 0.1 : 0.02)
            : "transparent",
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        style={{
          ...styles.header,
          borderBottomWidth: expanded ? 1 : 0,
          borderColor: hexToRgba(colors.text, 0.1),
        }}
      >
        <View className="flex-row items-center gap-2">
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            type="semibold"
            style={styles.title}
          >
            {title}
          </ThemedText>
          {description && (
            <Tooltip title={title} description={description}>
              <CircleQuestionMark
                color={hexToRgba(colors.text, 0.7)}
                size={14}
              />
            </Tooltip>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {withCheckbox && (
            <Checkbox
              disabled={checkDisabled}
              color={colors.text}
              checked={checked}
              onValueChange={onCheckedChange}
            />
          )}
          <Animated.View style={rChevronStyle}>
            <ChevronDown color={colors.text} size={20} />
          </Animated.View>
        </View>
      </Pressable>

      <Animated.View
        style={[styles.contentContainer, rContentStyle]}
        pointerEvents={expanded ? "auto" : "none"}
      >
        <View onLayout={onLayout} style={styles.absoluteContent}>
          {hasMounted ? children : null}
        </View>
      </Animated.View>
    </View>
  );
};

export default Collapsible;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 16,
  },
  contentContainer: {
    width: "100%",
    overflow: "hidden",
  },
  absoluteContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
