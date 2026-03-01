import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";

type Props = {
	message: string;
};

const EmptyList: React.FC<Props> = ({ message }) => {
	const colors = useThemeColors();

	return (
		<View className="p-4 py-14 items-center justify-center gap-4">
			<Image
				style={{
					width: 250,
					height: 170,
					objectFit: "cover",
				}}
				source={require("@/assets/images/empty-folder-3d.png")}
			/>
			<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
				{message}
			</ThemedText>
		</View>
	);
};

export default EmptyList;
