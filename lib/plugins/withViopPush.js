const {
	withAppDelegate,
	withEntitlementsPlist,
	withInfoPlist,
	withXcodeProject,
} = require("@expo/config-plugins");

module.exports = function withVoipPush(config) {
	config = withEntitlementsPlist(config, (cfg) => {
		cfg.modResults["aps-environment"] = "production";
		return cfg;
	});

	config = withInfoPlist(config, (cfg) => {
		cfg.modResults.UIBackgroundModes = [
			...(cfg.modResults.UIBackgroundModes || []),
			"voip",
			"remote-notification",
			"audio",
		];
		return cfg;
	});

	config = withXcodeProject(config, (cfg) => {
		return cfg;
	});

	config = withAppDelegate(config, (cfg) => {
		let appDelegate = cfg.modResults.contents;
		cfg.modResults.contents = appDelegate;
		return cfg;
	});

	return config;
};
