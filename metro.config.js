const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
	const config = getDefaultConfig(__dirname);

	const { transformer, resolver } = config;

	config.transformer = {
		...transformer,
		babelTransformerPath: require.resolve("react-native-svg-transformer"),
	};

	config.resolver = {
		...resolver,
		assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
		sourceExts: [...resolver.sourceExts, "svg"],
		extraNodeModules: {
			"react-native-svg": require("path").resolve(__dirname, "node_modules/react-native-svg"),
			"react-native-webview": require("path").resolve(__dirname, "node_modules/react-native-webview"),
		},
	};
	config.resolver.assetExts.push("woff2");

	// Web preview builds (CI screenshots) swap native-only modules for a no-op
	// stub. iOS/Android resolution is untouched.
	const WEB_STUBS = [
		"@react-native-firebase/app",
		"@react-native-firebase/messaging",
		"react-native-voip-push-notification",
		"react-native-callkeep",
		"@notifee/react-native",
		"lock-screen-manager",
		"@daily-co/react-native-daily-js",
		"@daily-co/react-native-webrtc",
		"react-native-vision-camera",
		"react-native-vision-camera-face-detector",
		"react-native-maps",
		"react-native-pdf",
		"react-native-blob-util",
		"react-native-image-crop-picker",
		"@react-native-google-signin/google-signin",
		"expo-apple-authentication",
		"flutterwave-react-native",
		"react-native-view-shot",
		"react-native-barcode-creator",
		"expo-intent-launcher",
		"expo-local-authentication",
		"react-native-nitro-modules",
		"react-native-nitro-image",
		"@react-native-community/datetimepicker",
		"react-native-webview",
	];
	const stubPath = require("path").resolve(__dirname, "web-stubs/universal.js");
	const baseResolve = config.resolver.resolveRequest;
	config.resolver.resolveRequest = (context, moduleName, platform) => {
		if (platform === "web" && WEB_STUBS.some((m) => moduleName === m || moduleName.startsWith(m + "/"))) {
			return { type: "sourceFile", filePath: stubPath };
		}
		return baseResolve ? baseResolve(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
	};

	return withNativeWind(config, { input: "./global.css" });
})();
