import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";
import { Fonts } from "@/lib/constants/theme";

export type ThemedTextProps = TextProps & {
	type?: "default" | "title" | "semibold" | "subtitle" | "link";
	content?: "primary" | "shade" | "tinted" | "error";
};

const ThemedText: React.FC<ThemedTextProps> = ({
	style,
	type = "default",
	content,
	...rest
}) => {
	const colors = useThemeColors();

	return (
		<Text
			style={[
				{ color: colors["text"] },
				type === "default" ? styles.default : undefined,
				type === "title" ? styles.title : undefined,
				type === "semibold" ? styles.semibold : undefined,
				type === "subtitle" ? styles.subtitle : undefined,
				type === "link" ? styles.link : undefined,
				content && {
					color:
						content === "primary"
							? colors["primary-content"]
							: content === "shade"
								? colors["shade-content"]
								: content === "error"
									? "#ffff"
									: colors["primary"],
				},
				style,
			]}
			{...rest}
		/>
	);
};

export default ThemedText;

const styles = StyleSheet.create({
	default: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: Fonts.regular,
	},
	semibold: {
		fontSize: 18,
		lineHeight: 24,
		fontFamily: Fonts.semibold,
	},
	title: {
		fontSize: 32,
		lineHeight: 32,
		fontFamily: Fonts.semibold,
	},
	subtitle: {
		fontSize: 20,
		fontFamily: Fonts.regular,
	},
	link: {
		lineHeight: 30,
		fontSize: 16,
		color: "#0a7ea4",
		fontFamily: Fonts.regular,
	},
});
