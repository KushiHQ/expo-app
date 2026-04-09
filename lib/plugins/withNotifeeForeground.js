const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withNotifeeForeground(config) {
	return withAndroidManifest(config, (cfg) => {
		const manifest = cfg.modResults.manifest;
		const application = manifest.application[0];

		manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

		let foregroundService = application.service?.find(
			(s) => s["$"]["android:name"] === "app.notifee.core.ForegroundService",
		);

		if (!foregroundService) {
			foregroundService = {
				$: { "android:name": "app.notifee.core.ForegroundService" },
			};
			application.service = application.service || [];
			application.service.push(foregroundService);
		}

		foregroundService["$"]["android:foregroundServiceType"] =
			"phoneCall|camera|microphone|remoteMessaging|shortService|mediaPlayback|connectedDevice";

		foregroundService["$"]["tools:replace"] = "android:foregroundServiceType";

		return cfg;
	});
};
