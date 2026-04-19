import ExpoMap, { MapHosting } from "@/components/atoms/a-map";
import HostingFilterManager from "@/components/organisms/o-hosting-filter-manager";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useHostingFilterStore } from "@/lib/stores/hostings";
import { useHostingsQuery, PublishStatus, Hosting } from "@/lib/services/graphql/generated";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import HostingMapCard from "@/components/molecules/m-hosting-map-card";

export default function HostingDiscoveryMap() {
	const insets = useSafeAreaInsets();
	const colors = useThemeColors();
	const { filter } = useHostingFilterStore();
	
	const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
	const [selectedHosting, setSelectedHosting] = useState<Partial<Hosting> | null>(null);

	const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

	// Fetch hostings based on filters
	const [{ data, fetching }] = useHostingsQuery({
		variables: {
			filters: { ...filter, publishStatus: PublishStatus.Live },
		},
	});

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			setPermissionStatus(status);
			if (status !== 'granted') {
				Alert.alert("Permission Denied", "Location permission is required to show your current location on the map.");
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			setUserLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		})();
	}, []);

	const mapHostings: MapHosting[] = data?.hostings?.map(h => ({
		id: h.id,
		latitude: Number(h.latitude),
		longitude: Number(h.longitude),
		price: Number(h.price),
		title: h.title ?? "",
	})).filter(h => !isNaN(h.latitude) && !isNaN(h.longitude)) || [];

	const handleMarkerSelect = (mapH: MapHosting) => {
		const fullHosting = data?.hostings?.find(h => h.id === mapH.id);
		if (fullHosting) {
			setSelectedHosting(fullHosting as any);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Discovery Map */}
			<ExpoMap 
				hostings={mapHostings}
				coordinates={userLocation || undefined}
				onMarkerSelect={handleMarkerSelect}
				zoom={12}
			/>

			{/* Floating Filter Manager */}
			<View 
				className="absolute left-0 right-0 px-4"
				style={{ top: insets.top + 10 }}
			>
				<HostingFilterManager isMapView={true} />
			</View>

			{/* Selected Hosting Card */}
			{selectedHosting && (
				<HostingMapCard 
					hosting={selectedHosting} 
					onClose={() => setSelectedHosting(null)} 
				/>
			)}

			{/* Loading Indicator */}
			{fetching && (
				<View 
					className="absolute top-1/2 left-1/2 -ml-6 -mt-6 w-12 h-12 rounded-full items-center justify-center bg-white shadow-lg"
					style={{ zIndex: 100 }}
				>
					<ActivityIndicator color={colors.primary} />
				</View>
			)}
		</View>
	);
}
