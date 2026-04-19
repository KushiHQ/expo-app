import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle, GestureResponderEvent } from "react-native";
import { twMerge } from "tailwind-merge";
import * as Haptics from "expo-haptics";

const BackButton: React.FC<
	Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }
> = ({ style, className, onPress, ...rest }) => {
	const colors = useThemeColors();

	const handlePress = (event: GestureResponderEvent) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress?.(event);
	};

	return (
		<Pressable
			style={[{ backgroundColor: hexToRgba(colors["icon"], 0.6) }, style]}
			className={twMerge(
				"h-10 w-10 absolute top-16 left-6 items-center justify-center rounded-xl",
				className,
			)}
			onPress={handlePress}
			{...rest}
			aria-label="Go Back"
		>
			<ChevronLeft color={colors["text"]} />
		</Pressable>
	);
};

export default BackButton;
