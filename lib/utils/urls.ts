import { Alert, Linking, Platform } from 'react-native';

type Coordinates = { longitude: number; latitude: number };

// Kushi's store identifiers (stable): Apple App Store id from eas.json
// (ascAppId), Android package from app.config.js.
const IOS_APP_STORE_ID = '6768449564';
const ANDROID_PACKAGE = 'com.kushicorp.kushi';

/**
 * Open the device's app store on the Kushi listing so the user can update.
 * Prefers the native store scheme (deep-links straight into the store app),
 * falling back to the https store URL if that isn't available.
 */
export const openAppStore = async () => {
  const native =
    Platform.OS === 'ios'
      ? `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}`
      : `market://details?id=${ANDROID_PACKAGE}`;
  const web =
    Platform.OS === 'ios'
      ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
      : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  try {
    if (await Linking.canOpenURL(native)) {
      await Linking.openURL(native);
    } else {
      await Linking.openURL(web);
    }
  } catch (error) {
    console.error('Failed to open app store:', error);
    try {
      await Linking.openURL(web);
    } catch {
      Alert.alert('Update Kushi', 'Please open your app store to update Kushi.');
    }
  }
};

/**
 * True when a notification's `intent` marks it as an app-update prompt.
 * Tolerant of the different spellings the value takes across layers
 * (`app-update` push, `AppUpdate` serde, `APP_UPDATE` GraphQL enum).
 */
export const isAppUpdateIntent = (intent?: string | null) =>
  !!intent && String(intent).toLowerCase().replace(/[^a-z]/g, '') === 'appupdate';

export const openGoogleMaps = async (coordinates: Coordinates) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Google Maps is not installed on your device.');
    }
  } catch (error) {
    console.error('Failed to open Google Maps:', error);
    Alert.alert('Error', 'Could not open Google Maps.');
  }
};

export const getDefaultProfileImageUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${name.toUpperCase().split(' ').join('+')}=random`;
};

export const getAssetResizeUrl = (
  assetId: string,
  width: number,
  height: number,
  quality = 85,
  /** Asset `lastUpdated` — busts the image cache when the file is replaced in place. */
  version?: string | number | null,
) => {
  const serverUrl = (process.env.EXPO_PUBLIC_GRAPHQL_URL ?? '').replace('/graphql', '');
  const v = version ? `&v=${encodeURIComponent(String(version))}` : '';
  return `${serverUrl}/assets/proxy/${assetId}?w=${width}&h=${height}&q=${quality}${v}`;
};

/**
 * Append an asset's `lastUpdated` as a cache-busting `?v=`/`&v=` param so
 * expo-image (cachePolicy="memory-disk") refetches after an in-place image
 * replace — the underlying URL is otherwise identical. See RC2 in
 * sprints/expo-state-freshness-plan.md.
 */
export const withAssetVersion = (url?: string | null, version?: string | number | null) => {
  if (!url) return url ?? undefined;
  if (!version) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
};
