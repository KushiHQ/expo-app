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
};

const Button: React.FC<Props> = ({ style, children, ...rest }) => {
	return (
		<Pressable
			style={[styles.button, style, rest.disabled && { opacity: 0.6 }]}
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
