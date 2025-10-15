import { Platform } from "react-native";
import { AppleMaps, CameraPosition, GoogleMaps } from "expo-maps";
import React from "react";

type Props = {
	coordinates?: {
		longitude: number;
		latitude: number;
	};
	zoom?: number;
	title?: string;
};

const ExpoMap: React.FC<Props> = ({ coordinates, title, zoom }) => {
	const cameraPosition: CameraPosition = {
		coordinates,
		zoom,
	};

	if (Platform.OS === "ios") {
		return (
			<AppleMaps.View
				style={{ flex: 1 }}
				cameraPosition={cameraPosition}
				markers={[
					{
						coordinates,
						title,
					},
				]}
			/>
		);
	}

	return (
		<GoogleMaps.View
			style={{ flex: 1 }}
			cameraPosition={cameraPosition}
			markers={[{ coordinates, title }]}
		/>
	);
};

export default ExpoMap;
