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

const MARGIN = 10; // minimum gap to the screen edges
const GAP = 12; // gap between the trigger and the bubble
const ARROW_SIZE = 12;

interface TooltipProps {
	title?: string;
	description: string;
	className?: string;
	position?: "top" | "right" | "bottom" | "left";
	children: React.ReactNode;
}

const clamp = (value: number, min: number, max: number) =>
	Math.max(min, Math.min(value, max));

const Tooltip: React.FC<TooltipProps> = ({
	title,
	className,
	description,
	position = "top",
	children,
}) => {
	const colors = useThemeColors();
	const triggerRef = useRef<View>(null);
	const overlayRef = useRef<View>(null);

	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
	// The Portal overlay may not start at the window origin (status bar /
	// navigation header), so positions are computed in window coordinates and
	// translated by the overlay's measured origin instead of magic offsets.
	const [overlayOrigin, setOverlayOrigin] = useState({ x: 0, y: 0 });

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

	const { width: ttWidth, height: ttHeight } = tooltipSize;
	const triggerCenterX = coords.x + coords.width / 2;
	const triggerCenterY = coords.y + coords.height / 2;

	// Flip the requested placement when the bubble would not fit on that side.
	let placement = position;
	if (placement === "right" || placement === "left") {
		const fitsRight =
			coords.x + coords.width + GAP + ttWidth <= SCREEN_WIDTH - MARGIN;
		const fitsLeft = coords.x - GAP - ttWidth >= MARGIN;
		if (placement === "right" && !fitsRight) {
			placement = fitsLeft ? "left" : "bottom";
		} else if (placement === "left" && !fitsLeft) {
			placement = fitsRight ? "right" : "bottom";
		}
	}
	if (placement === "top" || placement === "bottom") {
		const fitsAbove = coords.y - GAP - ttHeight >= MARGIN;
		const fitsBelow =
			coords.y + coords.height + GAP + ttHeight <= SCREEN_HEIGHT - MARGIN;
		if (placement === "top" && !fitsAbove && fitsBelow) {
			placement = "bottom";
		} else if (placement === "bottom" && !fitsBelow && fitsAbove) {
			placement = "top";
		}
	}

	// Window-space position, clamped to the screen on both axes.
	let windowLeft: number;
	let windowTop: number;
	if (placement === "top" || placement === "bottom") {
		windowLeft = clamp(
			triggerCenterX - ttWidth / 2,
			MARGIN,
			Math.max(MARGIN, SCREEN_WIDTH - ttWidth - MARGIN),
		);
		windowTop =
			placement === "top"
				? coords.y - GAP - ttHeight
				: coords.y + coords.height + GAP;
	} else {
		windowLeft =
			placement === "right"
				? coords.x + coords.width + GAP
				: coords.x - GAP - ttWidth;
		windowTop = clamp(
			triggerCenterY - ttHeight / 2,
			MARGIN,
			Math.max(MARGIN, SCREEN_HEIGHT - ttHeight - MARGIN),
		);
	}

	const tooltipPosStyle = {
		left: windowLeft - overlayOrigin.x,
		top: windowTop - overlayOrigin.y,
	};

	// The arrow keeps pointing at the trigger even when the bubble is clamped.
	let arrowPosStyle: any = {};
	if (placement === "top" || placement === "bottom") {
		arrowPosStyle = {
			[placement === "top" ? "bottom" : "top"]: -ARROW_SIZE / 2 + 1,
			left: clamp(
				triggerCenterX - windowLeft - ARROW_SIZE / 2,
				8,
				Math.max(8, ttWidth - ARROW_SIZE - 8),
			),
		};
	} else {
		arrowPosStyle = {
			[placement === "right" ? "left" : "right"]: -ARROW_SIZE / 2 + 1,
			top: clamp(
				triggerCenterY - windowTop - ARROW_SIZE / 2,
				8,
				Math.max(8, ttHeight - ARROW_SIZE - 8),
			),
		};
	}

	const rTooltipStyle = useAnimatedStyle(() => {
		const translateY =
			placement === "top"
				? (1 - animation.value) * 10
				: placement === "bottom"
					? -(1 - animation.value) * 10
					: 0;
		const translateX =
			placement === "left"
				? (1 - animation.value) * 10
				: placement === "right"
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
						ref={overlayRef}
						style={StyleSheet.absoluteFillObject}
						onPress={closeTooltip}
						onLayout={() => {
							overlayRef.current?.measureInWindow((x, y) => {
								if (x !== overlayOrigin.x || y !== overlayOrigin.y) {
									setOverlayOrigin({ x, y });
								}
							});
						}}
					>
						<Animated.View
							onLayout={(e) => {
								const { width: w, height: h } = e.nativeEvent.layout;
								if (
									w &&
									h &&
									(w !== tooltipSize.width || h !== tooltipSize.height)
								) {
									setTooltipSize({ width: w, height: h });
								}
							}}
							style={[
								styles.tooltipBubble,
								{ backgroundColor: colors.text },
								tooltipPosStyle,
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
		maxWidth: SCREEN_WIDTH * 0.8,
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
		width: ARROW_SIZE,
		height: ARROW_SIZE,
		transform: [{ rotate: "45deg" }],
	},
});
