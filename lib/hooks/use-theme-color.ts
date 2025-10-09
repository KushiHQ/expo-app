/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/lib/constants/theme";
import { useColorScheme } from "@/lib/hooks/use-color-scheme";

export function useThemeColors() {
	const theme = useColorScheme() ?? "light";

	return Colors[theme];
}
