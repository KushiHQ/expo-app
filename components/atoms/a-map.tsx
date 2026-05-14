import React, { useMemo, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "./a-themed-text";

export type MapHosting = {
	id: string;
	latitude: number;
	longitude: number;
	price: number;
	title: string;
};

type Props = {
	coordinates?: {
		longitude: number;
		latitude: number;
	};
	zoom?: number;
	title?: string;
	hostings?: MapHosting[];
	onMarkerSelect?: (hosting: MapHosting) => void;
	showUserLocation?: boolean;
};

const ExpoMap: React.FC<Props> = ({
	coordinates,
	title,
	zoom = 12,
	hostings = [],
	onMarkerSelect,
}) => {
	const colors = useThemeColors();
	const mapRef = useRef<MapView>(null);

	const initialRegion = useMemo(() => {
		const lat = coordinates?.latitude || hostings[0]?.latitude || 6.5244;
		const lng = coordinates?.longitude || hostings[0]?.longitude || 3.3792;
		
		const delta = 0.1 / Math.pow(2, zoom - 12);

		return {
			latitude: lat,
			longitude: lng,
			latitudeDelta: delta,
			longitudeDelta: delta,
		};
	}, []);

	useEffect(() => {
		if (coordinates && mapRef.current) {
			mapRef.current.animateToRegion({
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05,
			}, 1000);
		}
	}, [coordinates]);

	const formatPrice = (price: number) => {
		if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
		if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
		return price.toString();
	};

	return (
		<MapView
			ref={mapRef}
			style={styles.map}
			provider={Platform.OS === "ios" ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
			initialRegion={initialRegion}
			showsUserLocation={false}
		>
			{hostings.map((h) => (
				<Marker
					key={h.id}
					coordinate={{ latitude: h.latitude, longitude: h.longitude }}
					onPress={() => onMarkerSelect?.(h)}
					// anchor is better for positioning the tip at the coordinate
					anchor={{ x: 0.5, y: 1 }}
				>
					<View style={styles.markerContainer}>
						<View
							style={[styles.priceBubble, { backgroundColor: colors.accent }]}
						>
							<ThemedText style={styles.priceText}>₦{formatPrice(h.price)}</ThemedText>
						</View>
						<View style={[styles.pointer, { borderTopColor: colors.accent }]} />
					</View>
				</Marker>
			))}

			{coordinates && (
				<Marker
					coordinate={coordinates}
					title={title || "Your Location"}
					zIndex={100}
					anchor={{ x: 0.5, y: 0.5 }}
				>
					<View style={styles.userLocationMarker}>
						<View style={[styles.userLocationDot, { backgroundColor: colors.primary }]} />
					</View>
				</Marker>
			)}
		</MapView>
	);
};

const styles = StyleSheet.create({
	map: {
		flex: 1,
	},
	markerContainer: {
		alignItems: "center",
		paddingBottom: 8, // Ensure pointer is fully inside the capture area
	},
	priceBubble: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 4,
	},
	priceText: {
		color: "white",
		fontSize: 14,
		fontWeight: "bold",
	},
	pointer: {
		width: 0,
		height: 0,
		backgroundColor: "transparent",
		borderStyle: "solid",
		borderLeftWidth: 7,
		borderRightWidth: 7,
		borderTopWidth: 9,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		// Overlap slightly with the bubble to prevent a gap
		marginTop: -1, 
	},
	userLocationMarker: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 6,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.1)",
	},
	userLocationDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
});

export default ExpoMap;
