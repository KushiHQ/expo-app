const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidSigning(config) {
	return withAppBuildGradle(config, (config) => {
		if (process.env.EAS_BUILD === "true") {
			console.log("☁  Running on EAS: Skipping local signing configuration.");
			return config;
		}

		const keystorePassword = process.env.EAS_KEYSTORE_PASSWORD;
		const keyAlias = process.env.EAS_KEY_ALIAS;
		const keyPassword = process.env.EAS_KEY_PASSWORD;

		if (!keystorePassword || !keyAlias || !keyPassword) {
			console.warn(
				"!  Warning: Missing EAS Keystore credentials in .env file.\n" +
					"Skipping local signing configuration. Google Sign-In may fail locally.",
			);
			return config;
		}

		if (config.modResults.language === "groovy") {
			const easDebugConfig = `signingConfigs {
        debug {
            storeFile file("../../eas-release.keystore")
            storePassword "${keystorePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
      }`;

			if (
				config.modResults.contents.includes("storeFile file('debug.keystore')")
			) {
				config.modResults.contents = config.modResults.contents.replace(
					/debug\s*{\s*storeFile file\('debug.keystore'\)[\s\S]*?}/,
					`debug {
                storeFile file("../../eas-release.keystore")
                storePassword "${keystorePassword}"
                keyAlias "${keyAlias}"
                keyPassword "${keyPassword}"
            }`,
				);
			} else {
				config.modResults.contents += `\nandroid { ${easDebugConfig} }`;
			}
		}
		return config;
	});
};
