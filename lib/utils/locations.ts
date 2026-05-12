import * as Location from "expo-location";
import { Alert, Platform } from "react-native";

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

export const getLocationAsync = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    return location;
  } catch {
    alert("Could not get your location.");
    return null;
  }
};

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number,
) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(data.error_message || `Google API error: ${data.status}`);
    }

    if (data.results.length === 0) {
      throw new Error("No results found");
    }

    const result = data.results[0];

    const addressComponents = result.address_components.reduce(
      (acc: Record<string, string>, component: any) => {
        const type = component.types[0];
        acc[type] = component.long_name;
        if (type === "country") {
          acc["isoCountryCode"] = component.short_name;
        }
        return acc;
      },
      {},
    );

    const parsedAddress = {
      name: result.formatted_address,
      street: addressComponents.route || "",
      streetNumber: addressComponents.street_number || "",
      city:
        addressComponents.locality ||
        addressComponents.administrative_area_level_3 ||
        "",
      district:
        addressComponents.neighborhood || addressComponents.sublocality || "",
      subregion: addressComponents.administrative_area_level_2 || "",
      region: addressComponents.administrative_area_level_1 || "",
      postalCode: addressComponents.postal_code || "",
      country: addressComponents.country || "",
      isoCountryCode: addressComponents.isoCountryCode || "",
      timezone: "",
    };

    return [parsedAddress];
  } catch (error) {
    console.error("Error fetching address:", error);
    Alert.alert("Error", "Could not fetch address");
    return [];
  }
};
