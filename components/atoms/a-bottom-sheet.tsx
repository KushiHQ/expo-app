import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import {
	StyleSheet,
	Dimensions,
	View,
	Pressable,
	ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	interpolate,
	Extrapolation,
	withTiming,
} from "react-native-reanimated";
import { Portal } from "react-native-paper";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useGradualKeyboardAnimation } from "@/lib/hooks/keyboard";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BottomSheetProps {
	scrollable?: boolean;
	isVisible: boolean;
	onClose: () => void;
	children: ReactNode;
}

const BottomSheet: FC<BottomSheetProps> = ({
	scrollable = true,
	isVisible,
	onClose,
	children,
}) => {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();

	const [isRendered, setIsRendered] = useState(isVisible);

	const sheetHeight = useSharedValue(0);
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const { height: keyboardHeight } = useGradualKeyboardAnimation();

	const toggleSheet = useCallback((show: boolean) => {
		"worklet";
		if (show) {
			translateY.value = withSpring(0, {
				damping: 50,
				stiffness: 400,
			});
		} else {
			const dest = sheetHeight.value || SCREEN_HEIGHT;
			translateY.value = withTiming(dest, { duration: 250 }, (finished) => {
				if (finished) {
					scheduleOnRN(setIsRendered, false);
				}
			});
		}
	}, [sheetHeight, translateY]);

	useEffect(() => {
		if (isVisible) {
			setIsRendered(true);
		} else {
			toggleSheet(false);
		}
	}, [isVisible, toggleSheet]);

	const onLayout = useCallback(
		(event: any) => {
			const h = event.nativeEvent.layout.height;
			const clampedHeight = Math.min(h, MAX_HEIGHT);

			sheetHeight.value = clampedHeight;

			if (isVisible) {
				toggleSheet(true);
			}
		},
		[isVisible, toggleSheet, sheetHeight],
	);

	const panGesture = Gesture.Pan()
		.onChange((event) => {
			const offset = event.translationY;
			if (offset > 0) {
				translateY.value = offset;
			} else {
				translateY.value = offset * 0.1;
			}
		})
		.onEnd(() => {
			if (translateY.value > sheetHeight.value / 3) {
				scheduleOnRN(onClose);
			} else {
				toggleSheet(true);
			}
		});

	const rBottomSheetStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateY: translateY.value },
				{ translateY: -keyboardHeight.value },
			],
		};
	});

	const rBackdropStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				translateY.value,
				[0, sheetHeight.value],
				[0.2, 0],
				Extrapolation.CLAMP,
			),
		};
	});

	if (!isRendered) return null;

	return (
		<Portal>
			<View style={StyleSheet.absoluteFill}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
					<Animated.View
						style={[
							StyleSheet.absoluteFill,
							{ backgroundColor: colors.text },
							rBackdropStyle,
						]}
					/>
				</Pressable>

				<Animated.View
					style={[
						styles.bottomSheetContainer,
						{
							backgroundColor: colors.background,
							borderColor: hexToRgba(colors.text, 0.1),
						},
						rBottomSheetStyle,
					]}
				>
					<GestureDetector gesture={panGesture}>
						<View style={styles.handleContainer} hitSlop={20}>
							<View
								style={[
									styles.handle,
									{ backgroundColor: hexToRgba(colors.text, 0.4) },
								]}
							/>
						</View>
					</GestureDetector>

					<View onLayout={onLayout} style={{ maxHeight: MAX_HEIGHT }}>
						{scrollable ? (
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								contentContainerStyle={{ flexGrow: 0 }}
							>
								<View style={styles.contentPadding}>{children}</View>
							</ScrollView>
						) : (
							<View style={styles.contentPadding}>{children}</View>
						)}
						<View style={{ height: Math.max(insets.bottom, 20) }} />
					</View>
				</Animated.View>
			</View>
		</Portal>
	);
};

const styles = StyleSheet.create({
	bottomSheetContainer: {
		width: "100%",
		position: "absolute",
		bottom: 0,
		borderTopLeftRadius: 25,
		borderTopRightRadius: 25,
		borderTopWidth: 1,
		zIndex: 1000,
	},
	handleContainer: {
		width: "100%",
		alignItems: "center",
		paddingVertical: 12,
	},
	handle: {
		width: 40,
		height: 5,
		borderRadius: 3,
	},
	contentPadding: {
		paddingHorizontal: 20,
	},
});

export default BottomSheet;
