import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import { twMerge } from "tailwind-merge";

const BackButton: React.FC<
	Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }
> = ({ style, className, ...rest }) => {
	const colors = useThemeColors();

	return (
		<Pressable
			style={[{ backgroundColor: hexToRgba(colors["icon"], 0.6) }, style]}
			className={twMerge(
				"h-8 w-8 absolute top-16 left-6 items-center justify-center rounded-full",
				className,
			)}
			{...rest}
			aria-label="Go Back"
		>
			<ChevronLeft color={colors["text"]} />
		</Pressable>
	);
};

export default BackButton;
