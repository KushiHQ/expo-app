import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { LetsIconsBoxOpenFillDuotone } from "../icons/i-box";

type Props = {
	message: string;
};

const EmptyList: React.FC<Props> = ({ message }) => {
	const colors = useThemeColors();

	return (
		<View
			className="p-4 py-20 items-center justify-center border rounded-2xl gap-4"
			style={{ borderColor: hexToRgba(colors.text, 0.15) }}
		>
			<LetsIconsBoxOpenFillDuotone color={colors.primary} size={60} />
			<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
				{message}
			</ThemedText>
		</View>
	);
};

export default EmptyList;
