import "dotenv/config";
import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "kushi",
  slug: "kushi",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "kushi",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.kushi",
  },
  android: {
    package: "com.anonymous.kushi",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "@react-native-community/datetimepicker",
      {
        android: {
          datePicker: {
            colorAccent: {
              light: "#266DD3",
              dark: "#266DD3",
            },
            textColorPrimary: {
              light: "#11181C",
              dark: "#f0f0f0",
            },
            textColorPrimaryInverse: {
              light: "#ffffff",
              dark: "#000000",
            },
            windowBackground: {
              light: "#fff",
              dark: "#000000",
            },
          },
          timePicker: {
            background: {
              light: "#266DD3",
              dark: "#266DD3",
            },
            numbersBackgroundColor: {
              light: "#266DD3",
              dark: "#266DD3",
            },
          },
        },
      },
    ],
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-font",
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID.",
      },
    ],
    [
      "expo-maps",
      {
        requestLocationPermission: true,
        locationPermission: "Allow $(PRODUCT_NAME) to use your location",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
