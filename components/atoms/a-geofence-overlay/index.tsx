import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Platform, View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { Fonts } from '@/lib/constants/theme';

type Props = {
  hostingLatitude: string;
  hostingLongitude: string;
  visible: boolean;
};

const CLOSE_THRESHOLD = 200;
const MEDIUM_THRESHOLD = 500;

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getGeofenceColor(distance: number): { bg: string; text: string } {
  if (distance <= CLOSE_THRESHOLD) {
    return { bg: 'rgba(34, 197, 94, 0.16)', text: '#22C55E' };
  }
  if (distance <= MEDIUM_THRESHOLD) {
    return { bg: 'rgba(251, 191, 36, 0.16)', text: '#FBBF24' };
  }
  return { bg: 'rgba(239, 68, 68, 0.16)', text: '#EF4444' };
}

function getLabel(distance: number): string {
  if (distance <= CLOSE_THRESHOLD) return 'At property';
  if (distance <= MEDIUM_THRESHOLD) return 'Near property';
  return 'Far from property';
}

const GeofenceOverlay: React.FC<Props> = ({ hostingLatitude, hostingLongitude, visible }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const hostingLat = parseFloat(hostingLatitude);
  const hostingLng = parseFloat(hostingLongitude);

  const distance = useMemo(() => {
    if (!currentLocation) return null;
    return getDistanceMeters(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      hostingLat,
      hostingLng,
    );
  }, [currentLocation, hostingLat, hostingLng]);

  const geofenceColor = useMemo(
    () => (distance !== null ? getGeofenceColor(distance) : null),
    [distance],
  );

  useEffect(() => {
    if (!visible) {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
      return;
    }

    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      if (mounted) setCurrentLocation(initial);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5,
          timeInterval: 2000,
        },
        (loc) => {
          if (mounted) setCurrentLocation(loc);
        },
      );
    })();

    return () => {
      mounted = false;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, [visible]);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, [currentLocation]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { boxShadow: '0px 10px 28px -16px rgba(0,0,0,0.42)' } as any]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
          initialRegion={{
            latitude: hostingLat,
            longitude: hostingLng,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={false}
        >
          <Marker
            coordinate={{ latitude: hostingLat, longitude: hostingLng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.propertyMarker}>
              <View style={styles.propertyMarkerDot} />
            </View>
          </Marker>
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.deviceMarker}>
                <View style={styles.deviceMarkerInner} />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {distance !== null && geofenceColor && (
        <View
          style={[
            styles.distanceBadge,
            {
              backgroundColor: geofenceColor.bg,
            },
          ]}
        >
          <View style={[styles.distanceDot, { backgroundColor: geofenceColor.text }]} />
          <View style={styles.distanceTextGroup}>
            <Text style={[styles.distanceValue, { color: geofenceColor.text }]}>
              {formatDistance(distance)}
            </Text>
            <Text style={styles.distanceLabel}>{getLabel(distance)}</Text>
          </View>
        </View>
      )}

      {!currentLocation && (
        <View style={styles.searchingBadge}>
          <View style={styles.searchingPulse} />
          <Text style={styles.searchingText}>Acquiring GPS...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 140,
    alignItems: 'flex-end',
    gap: 8,
  },
  mapContainer: {
    width: 140,
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  map: {
    flex: 1,
  },
  propertyMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  propertyMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFA500',
  },
  deviceMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  deviceMarkerInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  distanceDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  distanceTextGroup: {
    gap: 0,
  },
  distanceValue: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    lineHeight: 16,
  },
  distanceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Fonts.regular,
    lineHeight: 12,
  },
  searchingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  searchingPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FBBF24',
  },
  searchingText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Fonts.medium,
  },
});

export default GeofenceOverlay;
