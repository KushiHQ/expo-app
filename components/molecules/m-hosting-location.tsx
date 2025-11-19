import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import LocationCard from "../atoms/a-location-card";
import { HostingQuery } from "@/lib/services/graphql/generated";

type Props = {
	hosting?: HostingQuery["hosting"];
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
			<LocationCard
				zoom={15}
				location={
					hosting?.latitude && hosting.latitude
						? {
							longitude: Number(hosting.longitude),
							latitude: Number(hosting.latitude),
						}
						: undefined
				}
				title={hosting?.title}
			/>
		</View>
	);
};

export default HostingLocation;
