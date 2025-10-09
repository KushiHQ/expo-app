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
	type?: "primary" | "shade" | "tinted";
};

const Button: React.FC<Props> = ({ style, children, type, ...rest }) => {
	const colors = useThemeColors();

	return (
		<Pressable
			style={[
				styles.button,
				style,
				rest.disabled && { opacity: 0.6 },
				type && {
					backgroundColor:
						type === "primary"
							? colors["primary"]
							: type === "shade"
								? colors["shade"]
								: hexToRgba(colors["primary"], 0.15),
				},
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
		borderRadius: 8,
	},
});
