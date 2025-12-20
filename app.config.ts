import "dotenv/config";
import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "Kushi",
	slug: "kushi",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./assets/icons/adaptive-icon.png",
	scheme: "kushi",
	userInterfaceStyle: "automatic",
	newArchEnabled: true,
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.mceazy2700.kushi",
		infoPlist: {
			NSLocationWhenInUseUsageDescription:
				"This app needs access to your location to determine the address of properties.",

			ITSAppUsesNonExemptEncryption: false,
		},
		icon: {
			dark: "./assets/icons/ios-dark.png",
			light: "./assets/icons/ios-light.png",
			tinted: "./assets/icons/ios-tinted.png",
		},
	},
	android: {
		package: "com.mceazy2700.kushi",
		googleServicesFile: "./google-services.json",
		adaptiveIcon: {
			backgroundColor: "#E6F4FE",
			foregroundImage: "./assets/icons/adaptive-icon.png",
			monochromeImage: "./assets/icons/ios-tinted.png",
		},
		permissions: [
			"android.permission.ACCESS_COARSE_LOCATION",
			"android.permission.ACCESS_FINE_LOCATION",
		],
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
		favicon: "./assets/icons/adaptive-icon.png",
	},
	extra: {
		eas: {
			projectId: "c5a2d72c-0706-49ba-b9ea-9a063526c049",
		},
	},
	owner: "mceazy2700",
	plugins: [
		"./lib/plugins/with-custom-sound.js",
		"expo-web-browser",
		[
			"expo-notifications",
			{
				icon: "./assets/icons/adaptive-icon.png",
			},
		],
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
			"expo-build-properties",
			{
				android: {
					minSdkVersion: 24,
				},
			},
		],
		[
			"expo-splash-screen",
			{
				image: "./assets/icons/splash-icon-dark.png",
				imageWidth: 200,
				resizeMode: "contain",
				backgroundColor: "#ffffff",
				dark: {
					image: "./assets/icons/splash-icon-light.png",
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
		"@stream-io/video-react-native-sdk",
		[
			"@config-plugins/react-native-webrtc",
			{
				cameraPermission:
					"$(PRODUCT_NAME) requires camera access in order to capture and transmit video",
				microphonePermission:
					"$(PRODUCT_NAME) requires microphone access in order to capture and transmit audio",
				runServiceOnBoot: true,
			},
		],
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
});
