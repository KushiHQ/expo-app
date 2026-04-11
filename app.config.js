import "dotenv/config";

/**
 * @param {import('expo/config').ConfigContext} context
 * @returns {import('expo/config').ExpoConfig}
 */
export default ({ config }) => ({
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
		usesAppleSignIn: true,
		supportsTablet: true,
		bundleIdentifier: "com.mceazy2700.kushi",
		googleServicesFile: "./GoogleService-Info.plist",
		useNextNotificationsApi: true,
		entitlements: {
			"com.apple.developer.usernotifications.communication": true,
			"aps-environment": "production",
		},
		infoPlist: {
			NSLocationWhenInUseUsageDescription:
				"This app needs access to your location to determine the address of properties.",
			ITSAppUsesNonExemptEncryption: false,
			UIBackgroundModes: ["remote-notification", "audio"],
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
			"android.permission.POST_NOTIFICATIONS",
			"android.permission.FOREGROUND_SERVICE",
			"android.permission.USE_FULL_SCREEN_INTENT",
			"android.permission.WAKE_LOCK",
			"android.permission.DISABLE_KEYGUARD",
			"android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE",
			"android.permission.FOREGROUND_SERVICE_MEDIA_PROCESSING",
			"android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
			"android.permission.FOREGROUND_SERVICE_CAMERA",
			"android.permission.FOREGROUND_SERVICE_MICROPHONE",
			"android.permission.FOREGROUND_SERVICE_PHONE_CALL",
			"android.permission.FOREGROUND_SERVICE_REMOTE_MESSAGING",
			"android.permission.MANAGE_OWN_CALLS",
			"android.permission.READ_PHONE_STATE",
			"android.permission.VIBRATE",
			"ACCESS_NETWORK_STATE",
			"BLUETOOTH",
			"CAMERA",
			"INTERNET",
			"MODIFY_AUDIO_SETTINGS",
			"RECORD_AUDIO",
			"SYSTEM_ALERT_WINDOW",
			"WAKE_LOCK",
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
		router: {
			origin: false,
		},
		eas: {
			projectId: "c5a2d72c-0706-49ba-b9ea-9a063526c049",
		},
	},
	owner: "mceazy2700",

	plugins: [
		"./lib/plugins/withNotifeeForeground.js",
		"./lib/plugins/withAndroidSigning.js",
		"react-native-vision-camera",
		"expo-audio",
		"expo-web-browser",
		[
			"@react-native-community/datetimepicker",
			{
				android: {
					datePicker: {
						colorAccent: { light: "#266DD3", dark: "#266DD3" },
						textColorPrimary: { light: "#11181C", dark: "#f0f0f0" },
						textColorPrimaryInverse: { light: "#ffffff", dark: "#000000" },
						windowBackground: { light: "#fff", dark: "#000000" },
					},
					timePicker: {
						background: { light: "#266DD3", dark: "#266DD3" },
						numbersBackgroundColor: { light: "#266DD3", dark: "#266DD3" },
					},
				},
			},
		],
		"expo-router",
		[
			"expo-build-properties",
			{
				android: {
					minSdkVersion: 26,
					extraMavenRepos: [
						"../../node_modules/@notifee/react-native/android/libs",
					],
				},
				ios: {
					useFrameworks: "static",
					forceStaticLinking: ["RNFBApp", "RNFBMessaging"],
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
		[
			"@daily-co/config-plugin-rn-daily-js",
			{
				enableCamera: true,
				enableMicrophone: true,
				enableScreenShare: false,
			},
		],
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
		"@react-native-firebase/app",
		"@react-native-firebase/messaging",
		"@react-native-google-signin/google-signin",
		"expo-apple-authentication",
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
});
