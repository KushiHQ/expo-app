import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface AnimatedStepperProps {
	steps: number;
	currentStep: number;
	size?: number;
	gap?: number;
	animationDuration?: number;
}

const AnimatedStepper: React.FC<AnimatedStepperProps> = ({
	steps,
	currentStep,
	size = 10,
	gap = 8,
	animationDuration = 300,
}) => {
	const colors = useThemeColors();
	const animations = useRef(
		Array.from({ length: steps }, () => new Animated.Value(0)),
	).current;

	useEffect(() => {
		animations.forEach((anim, index) => {
			Animated.timing(anim, {
				toValue: index < currentStep ? 1 : 0,
				duration: animationDuration,
				useNativeDriver: false,
			}).start();
		});
	}, [currentStep, animations, animationDuration]);

	return (
		<View style={[styles.container, { gap }]}>
			{animations.map((anim, index) => {
				const backgroundColor = anim.interpolate({
					inputRange: [0, 1],
					outputRange: [hexToRgba(colors["primary"], 0.3), colors["primary"]],
				});

				return (
					<Animated.View
						key={index}
						style={[
							styles.step,
							{
								width: currentStep === index + 1 ? size * 2 : size,
								height: size,
								borderRadius: 10,
								backgroundColor,
							},
						]}
					/>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
	},
	step: {
		overflow: "hidden",
	},
});

export default AnimatedStepper;
