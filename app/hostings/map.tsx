import ExpoMap, { MapHosting } from '@/components/atoms/a-map';
import HostingFilterManager from '@/components/organisms/o-hosting-filter-manager';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useHostingFilterStore } from '@/lib/stores/hostings';
import { useHostingsQuery, PublishStatus, Hosting } from '@/lib/services/graphql/generated';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import HostingMapCard from '@/components/molecules/m-hosting-map-card';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { hexToRgba } from '@/lib/utils/colors';

export default function HostingDiscoveryMap() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const router = useRouter();
  const { filter } = useHostingFilterStore();
  const { hostingId, latitude, longitude, zoom, title, price } = useLocalSearchParams<{
    hostingId?: string;
    latitude?: string;
    longitude?: string;
    zoom?: string;
    title?: string;
    price?: string;
  }>();

  const isFocusedMode = !!hostingId;

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [selectedHosting, setSelectedHosting] = useState<Partial<Hosting> | null>(null);

  const [{ data, fetching }] = useHostingsQuery({
    variables: { filters: { ...filter, publishStatus: PublishStatus.Live, onSale: true } },
    pause: isFocusedMode,
  });

  useEffect(() => {
    if (isFocusedMode) return;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location on the map.',
        );
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    })();
  }, [isFocusedMode]);

  const focusedMarker: MapHosting[] =
    isFocusedMode && latitude && longitude
      ? [
          {
            id: hostingId!,
            latitude: Number(latitude),
            longitude: Number(longitude),
            price: Number(price ?? 0),
            title: decodeURIComponent(title ?? ''),
          },
        ]
      : [];

  const mapHostings: MapHosting[] = isFocusedMode
    ? focusedMarker
    : (data?.hostings
        ?.map((h) => ({
          id: h.id,
          latitude: Number(h.latitude),
          longitude: Number(h.longitude),
          price: Number(h.price),
          title: h.title ?? '',
        }))
        .filter((h) => !isNaN(h.latitude) && !isNaN(h.longitude)) ?? []);

  const handleMarkerSelect = (mapH: MapHosting) => {
    if (isFocusedMode) return;
    const fullHosting = data?.hostings?.find((h) => h.id === mapH.id);
    if (fullHosting) setSelectedHosting(fullHosting as any);
  };

  const focusCoordinates =
    isFocusedMode && latitude && longitude
      ? { latitude: Number(latitude), longitude: Number(longitude) }
      : (userLocation ?? undefined);

  return (
    <Pressable
      onPress={() => Keyboard.dismiss()}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ExpoMap
        hostings={mapHostings}
        coordinates={focusCoordinates}
        onMarkerSelect={handleMarkerSelect}
        zoom={isFocusedMode ? Number(zoom ?? 15) : 12}
      />

      {/* Back button */}
      <View style={{ position: 'absolute', top: insets.top + 10, left: 16 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
            borderWidth: 1,
            borderColor: hexToRgba(colors.text, 0.1),
          }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Filter UI — discovery mode only */}
      {!isFocusedMode && (
        <View className="absolute left-0 right-0 px-4" style={{ top: insets.top + 10, left: 56 }}>
          <HostingFilterManager isMapView={true} />
        </View>
      )}

      {!isFocusedMode && selectedHosting && (
        <HostingMapCard hosting={selectedHosting} onClose={() => setSelectedHosting(null)} />
      )}

      {!isFocusedMode && fetching && (
        <View
          className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg"
          style={{ zIndex: 100 }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </Pressable>
  );
}
