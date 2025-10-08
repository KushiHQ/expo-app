import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface LoadingDotsProps {
	size?: number;
	gap?: number;
	styles?: ViewStyle;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
	size = 10,
	gap = 12,
	styles: outerStyles,
}) => {
	const colors = useThemeColors();
	const animations = useRef([
		new Animated.Value(0),
		new Animated.Value(0),
		new Animated.Value(0),
	]).current;

	useEffect(() => {
		const createAnimation = (animValue: Animated.Value, delay: number) => {
			return Animated.loop(
				Animated.sequence([
					Animated.delay(delay),
					Animated.timing(animValue, {
						toValue: 1,
						duration: 750,
						useNativeDriver: true,
					}),
					Animated.timing(animValue, {
						toValue: 0,
						duration: 750,
						useNativeDriver: true,
					}),
				]),
			);
		};
		const parallelAnimations = animations.map((anim, index) =>
			createAnimation(anim, index * 200),
		);
		Animated.parallel(parallelAnimations).start();
	}, [animations]);
	return (
		<View
			style={[
				styles.container,
				{ gap, backgroundColor: hexToRgba(colors["primary"], 0.1) },
				outerStyles,
			]}
		>
			{animations.map((anim, index) => (
				<View
					key={index}
					style={[
						styles.circle,
						{
							width: size,
							height: size,
							borderRadius: size / 2,
							borderColor: colors["primary"],
						},
					]}
				>
					<Animated.View
						style={[
							styles.fill,
							{
								borderRadius: size / 2,
								backgroundColor: colors["primary"],
								transform: [
									{
										scaleX: anim,
									},
								],
							},
						]}
					/>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		paddingInline: 16,
		borderRadius: 30,
	},
	circle: {
		borderWidth: 1.5,
		overflow: "hidden",
		position: "relative",
	},
	fill: {
		position: "absolute",
		width: "100%",
		height: "100%",
		left: 0,
		top: 0,
	},
});

export default LoadingDots;
