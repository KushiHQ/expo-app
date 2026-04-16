// react-native.config.js
module.exports = {
	dependencies: {
		"react-native-callkeep": {
			platforms: {
				android: null, // Completely disables CallKeep on Android
			},
		},
	},
};
