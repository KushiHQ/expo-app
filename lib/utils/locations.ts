import * as Location from "expo-location";
import { Alert } from "react-native";

export const getLocationAsync = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return null;
  }

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
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission denied",
      "Permission to access location was denied",
    );
    return;
  }

  try {
    const addressArray = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return addressArray;
  } catch (error) {
    console.error("Error fetching address:", error);
    Alert.alert("Error", "Could not fetch address");
  }
};
