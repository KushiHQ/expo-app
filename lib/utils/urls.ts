import { Alert, Linking } from "react-native";

type Coordinates = { longitude: number; latitude: number };

export const openGoogleMaps = async (coordinates: Coordinates) => {
	const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;

	try {
		const supported = await Linking.canOpenURL(url);

		if (supported) {
			await Linking.openURL(url);
		} else {
			Alert.alert("Error", "Google Maps is not installed on your device.");
		}
	} catch (error) {
		console.error("Failed to open Google Maps:", error);
		Alert.alert("Error", "Could not open Google Maps.");
	}
};

export const getDefaultProfileImageUrl = (name: string) => {
	return `https://ui-avatars.com/api/?name=${name.toUpperCase().split(" ").join("+")}=random`;
};

export const getAssetResizeUrl = (
	assetId: string,
	width: number,
	height: number,
	quality = 85,
) => {
	const serverUrl = (process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "").replace("/graphql", "");
	return `${serverUrl}/assets/proxy/${assetId}?w=${width}&h=${height}&q=${quality}`;
};
