import * as Location from 'expo-location';
import { Alert } from 'react-native';

export type LocationObject = {
  name: any;
  street: any;
  streetNumber: any;
  city: any;
  district: any;
  subregion: any;
  region: any;
  postalCode: any;
  country: any;
  isoCountryCode: any;
  timezone: string;
};

/**
 * Join location parts (city, state, country…) into a display string, dropping
 * any that are empty/null so a missing field never leaves a dangling comma.
 */
export const joinLocation = (...parts: (string | null | undefined)[]) =>
  parts.filter((p) => !!p && String(p).trim().length > 0).join(', ');

export const getLocationAsync = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to tag media.');
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    return location;
  } catch (error) {
    console.error('getLocationAsync error:', error);
    Alert.alert('Error', 'Could not get your location.');
    return null;
  }
};

export const getAddressFromCoords = async (latitude: number, longitude: number) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || `Google API error: ${data.status}`);
    }

    if (data.results.length === 0) {
      throw new Error('No results found');
    }

    const result = data.results[0];

    // Google returns several results ordered most-specific → least. A remote pin's
    // first result is often a Plus Code missing the state/city, while a later,
    // coarser result carries it. Merge components across all results, keeping the
    // first (most specific) value seen for each type.
    const addressComponents = data.results.reduce(
      (acc: Record<string, string>, res: any) => {
        for (const component of res.address_components) {
          const type = component.types[0];
          if (!acc[type]) acc[type] = component.long_name;
          if (type === 'country' && !acc['isoCountryCode']) {
            acc['isoCountryCode'] = component.short_name;
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const parsedAddress = {
      name: result.formatted_address,
      street: addressComponents.route || '',
      streetNumber: addressComponents.street_number || '',
      // Remote/less-mapped areas often lack `locality`; fall back through
      // finer- and coarser-grained components (down to the LGA) so a city is
      // still resolved instead of coming back empty.
      city:
        addressComponents.locality ||
        addressComponents.administrative_area_level_3 ||
        addressComponents.sublocality ||
        addressComponents.neighborhood ||
        addressComponents.administrative_area_level_2 ||
        '',
      district: addressComponents.neighborhood || addressComponents.sublocality || '',
      subregion: addressComponents.administrative_area_level_2 || '',
      // Fall back to the LGA (level 2) when the state (level 1) is missing.
      region:
        addressComponents.administrative_area_level_1 ||
        addressComponents.administrative_area_level_2 ||
        '',
      postalCode: addressComponents.postal_code || '',
      country: addressComponents.country || '',
      isoCountryCode: addressComponents.isoCountryCode || '',
      timezone: '',
    };

    return [parsedAddress];
  } catch (error) {
    console.error('Error fetching address:', error);
    Alert.alert('Error', 'Could not fetch address');
    return [];
  }
};
