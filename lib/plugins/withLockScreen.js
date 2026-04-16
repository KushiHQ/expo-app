const { withAndroidManifest } = require("@expo/config-plugins");

const withLockScreen = (config) => {
	return withAndroidManifest(config, async (config) => {
		const androidManifest = config.modResults;
		const mainApplication = androidManifest.manifest.application[0];
		const mainActivity = mainApplication.activity.find(
			(a) => a.$["android:name"] === ".MainActivity",
		);

		if (mainActivity) {
			// ✨ Tells Android this activity is allowed over the lock screen!
			mainActivity.$["android:showWhenLocked"] = "true";
			mainActivity.$["android:turnScreenOn"] = "true";
		}

		return config;
	});
};

module.exports = withLockScreen;
