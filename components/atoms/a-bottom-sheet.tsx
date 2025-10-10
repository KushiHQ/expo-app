import React, { FC, ReactNode, useCallback, useEffect } from "react";
import { StyleSheet, Dimensions, View, TouchableOpacity } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Portal } from "react-native-paper";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
const MAX_TRANSLATE_Y = -SHEET_HEIGHT;

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const BottomSheet: FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  const colors = useThemeColors();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, {
        damping: 50,
        stiffness: 400,
      });
    } else {
      translateY.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible, translateY]);

  const scrollTo = useCallback(
    (destination: number) => {
      "worklet";
      translateY.value = withSpring(destination, {
        damping: 50,
        stiffness: 400,
      });
    },
    [translateY],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newValue = context.value.y + event.translationY;
      translateY.value = Math.max(MAX_TRANSLATE_Y, Math.min(0, newValue));
    })
    .onEnd(() => {
      if (translateY.value > MAX_TRANSLATE_Y / 2) {
        translateY.value = withTiming(0, { duration: 250 });
        scheduleOnRN(onClose);
      } else {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isVisible ? 0.4 : 0, { duration: 300 }),
    };
  }, [isVisible]);

  if (!isVisible && translateY.value === 0) {
    return null;
  }

  return (
    <Portal>
      <GestureHandlerRootView
        style={[
          StyleSheet.absoluteFillObject,
          { pointerEvents: isVisible ? "auto" : "none" },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        >
          <Animated.View
            style={[StyleSheet.absoluteFillObject, rBackdropStyle]}
          />
        </TouchableOpacity>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: colors["background"],
                shadowColor: hexToRgba(colors["text"], 0.1),
                borderTopWidth: 2,
                borderColor: hexToRgba(colors["text"], 0.05),
              },
              rBottomSheetStyle,
            ]}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: hexToRgba(colors["text"], 0.4),
                  borderRadius: 2.5,
                },
              ]}
            />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Portal>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    minHeight: SHEET_HEIGHT,
    width: "100%",
    position: "absolute",
    top: SCREEN_HEIGHT,
    borderRadius: 25,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default BottomSheet;
