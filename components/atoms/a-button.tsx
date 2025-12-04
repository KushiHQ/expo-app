import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import {
	ActivityIndicator,
	Pressable,
	PressableProps,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from "react-native";

type BaseProps = Omit<PressableProps, "style">;
type Props = BaseProps & {
	style?: StyleProp<ViewStyle>;
	loading?: boolean;
	variant?: "outline" | "solid";
	type?: "primary" | "shade" | "tinted" | "background" | "error" | "text";
};

const Button: React.FC<Props> = ({
	style,
	children,
	loading,
	variant,
	type,
	...rest
}) => {
	const colors = useThemeColors();

	const color =
		type === "primary"
			? colors["primary-content"]
			: type === "shade"
				? colors["shade-content"]
				: type === "error"
					? "#fff"
					: type === "text"
						? colors.background
						: colors.text;

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
										: type === "text"
											? colors.text
											: type === "error"
												? colors.error
												: hexToRgba(colors.primary, 0.2),
					}
					: type && {
						backgroundColor:
							type === "primary"
								? colors["primary"]
								: type === "shade"
									? colors["shade"]
									: type === "background"
										? colors["background"]
										: type === "text"
											? colors.text
											: type === "error"
												? colors.error
												: hexToRgba(colors["primary"], 0.2),
					},
				style,
				rest.disabled && { opacity: 0.6 },
			]}
			{...rest}
		>
			{loading ? <ActivityIndicator size="small" color={color} /> : children}
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
