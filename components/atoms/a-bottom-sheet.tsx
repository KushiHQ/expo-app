import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import {
	StyleSheet,
	Dimensions,
	View,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	useDerivedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Portal } from "react-native-paper";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useGradualKeyboardAnimation } from "@/lib/hooks/keyboard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
const MIN_HEIGHT = SCREEN_HEIGHT * 0.2;

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
	const [contentHeight, setContentHeight] = useState(0);
	const { height: keyboardHeight } = useGradualKeyboardAnimation();

	const finalHeight = Math.min(contentHeight, MAX_HEIGHT);
	const MAX_TRANSLATE_Y = -finalHeight;

	useEffect(() => {
		if (isVisible) {
			translateY.value = withSpring(MAX_TRANSLATE_Y, {
				damping: 50,
				stiffness: 400,
			});
		} else {
			translateY.value = withTiming(0, { duration: 150 });
		}
	}, [isVisible, translateY, MAX_TRANSLATE_Y]);

	const onContentLayout = useCallback((event: any) => {
		setContentHeight(event.nativeEvent.layout.height + 60);
	}, []);

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
				translateY.value = withTiming(0, { duration: 150 });
				scheduleOnRN(onClose);
			} else {
				translateY.value = withSpring(MAX_TRANSLATE_Y, {
					damping: 50,
					stiffness: 400,
				});
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
			opacity: withTiming(isVisible ? 0.4 : 0, { duration: 200 }),
		};
	}, [isVisible]);

	const isSheetFullyClosed = useDerivedValue(() => translateY.value <= 0);

	if (!isVisible && isSheetFullyClosed.value) {
		return null;
	}

	return (
		<Portal>
			<View
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

				<Animated.View
					style={[
						styles.bottomSheetContainer,
						{
							backgroundColor: colors["background"],
							shadowColor: hexToRgba(colors["text"], 0.1),
							borderTopWidth: 2,
							borderColor: hexToRgba(colors["text"], 0.09),
							height: finalHeight > 0 ? finalHeight : MIN_HEIGHT,
						},
						rBottomSheetStyle,
					]}
				>
					<GestureDetector gesture={panGesture}>
						<View style={{ width: "100%" }}>
							<View
								style={[
									styles.handle,
									{
										backgroundColor: hexToRgba(colors["text"], 0.4),
										borderRadius: 2.5,
									},
								]}
							/>
						</View>
					</GestureDetector>

					<ScrollView
						showsVerticalScrollIndicator={false}
						style={styles.contentContainer}
						keyboardShouldPersistTaps="handled"
					>
						<View onLayout={onContentLayout}>{children}</View>
					</ScrollView>
				</Animated.View>
			</View>
		</Portal>
	);
};

const styles = StyleSheet.create({
	bottomSheetContainer: {
		width: "100%",
		position: "absolute",
		top: SCREEN_HEIGHT + 10,
		borderRadius: 25,
		paddingHorizontal: 20,
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},
	handle: {
		width: 40,
		height: 6,
		alignSelf: "center",
		marginVertical: 10,
	},
	contentContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},
});

export default BottomSheet;
