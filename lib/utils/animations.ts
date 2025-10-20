import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";

interface UseCountUpProps {
	targetNumber: number;
	duration?: number;
}

/**
 * A custom hook to animate a number counting up from 0.
 * @param targetNumber The final number to count up to.
 * @param duration The duration of the animation in milliseconds (default: 500).
 * @returns The current number value during the animation.
 */
export const useCountUp = ({
	targetNumber,
	duration = 500,
}: UseCountUpProps): number => {
	const [count, setCount] = useState(0);

	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const listener = animatedValue.addListener(({ value }) => {
			setCount(Number(value.toPrecision(2)));
		});

		Animated.timing(animatedValue, {
			toValue: targetNumber,
			duration: duration,
			useNativeDriver: false,
		}).start();

		return () => {
			animatedValue.removeListener(listener);
		};
	}, [targetNumber, duration]);

	return count;
};
