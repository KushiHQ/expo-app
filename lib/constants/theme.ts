/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

const common = {
	primary: "#266DD3",
	"primary-01": "#E9F0FB",
	"primary-04": "#A8C5ED",
	"primary-content": "#fff",
	shade: "#212121",
	"shade-content": "#fff",
	accent: "#F59E0B",
	error: "#FF3F3F",
	success: "#008A05",
};

export const Colors = {
	light: {
		...common,
		text: "#11181C",
		background: "#fff",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
	},
	dark: {
		...common,
		text: "#f0f0f0",
		background: "#000000",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
	},
};

export const Fonts = {
	thin: "Inter_100",
	extralight: "Inter_200",
	light: "Inter_300",
	regular: "Inter_400",
	medium: "Inter_500",
	semibold: "Inter_600",
	bold: "Inter_700",
	extrabold: "Inter_800",
	black: "Inter_900",
};
