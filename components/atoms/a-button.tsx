import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import {
	Pressable,
	PressableProps,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from "react-native";

type BaseProps = Omit<PressableProps, "style">;
type Props = BaseProps & {
	style?: StyleProp<ViewStyle>;
	variant?: "outline" | "solid";
	type?: "primary" | "shade" | "tinted" | "background" | "error";
};

const Button: React.FC<Props> = ({
	style,
	children,
	variant,
	type,
	...rest
}) => {
	const colors = useThemeColors();

	return (
		<Pressable
			style={[
				styles.button,
				variant === "outline"
					? {
							borderWidth: variant === "outline" ? 1 : 0,
							borderColor:
								type === "primary"
									? colors.primary
									: type === "shade"
										? colors.shade
										: type === "background"
											? colors.background
											: type === "error"
												? colors.error
												: hexToRgba(colors.primary, 0.15),
						}
					: type && {
							backgroundColor:
								type === "primary"
									? colors["primary"]
									: type === "shade"
										? colors["shade"]
										: type === "background"
											? colors["background"]
											: type === "error"
												? colors.error
												: hexToRgba(colors["primary"], 0.15),
						},
				style,
				rest.disabled && { opacity: 0.6 },
				,
			]}
			{...rest}
		>
			{children}
		</Pressable>
	);
};

export default Button;

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		justifyContent: "center",
		padding: 14,
		borderRadius: 12,
	},
});
