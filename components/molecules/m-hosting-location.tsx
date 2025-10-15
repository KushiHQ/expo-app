import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { Hosting } from "@/lib/constants/mocks/hostings";
import React from "react";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import ExpoMap from "../atoms/a-map";
import { MaterialSymbolsExpandContentRounded } from "../icons/i-fullscreen";

type Props = {
	hosting?: Hosting;
};

const HostingLocation: React.FC<Props> = ({ hosting }) => {
	const colors = useThemeColors();

	return (
		<View className="mt-8 gap-6">
			<View className="gap-1">
				<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
					Pin the Location
				</ThemedText>
				<ThemedText
					style={{ color: hexToRgba(colors.text, 0.6), fontSize: 16 }}
				>
					{hosting?.city}, {hosting?.state}, {hosting?.country}
				</ThemedText>
			</View>
			<View
				className="relative border rounded-xl overflow-hidden"
				style={{ borderColor: colors.text, height: 250 }}
			>
				<ExpoMap
					title={hosting?.title}
					coordinates={hosting?.location}
					zoom={6}
				/>
				<Pressable
					className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
					style={{ backgroundColor: colors.text }}
				>
					<MaterialSymbolsExpandContentRounded
						size={24}
						color={colors.background}
					/>
				</Pressable>
			</View>
		</View>
	);
};

export default HostingLocation;
