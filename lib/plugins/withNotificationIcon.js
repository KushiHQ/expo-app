const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');

// Android draws notification icons as a single-colour silhouette, so the app
// icon shows up as a blank blob. Ship a white Kushi mark as ic_notification
// (used by Notifee via smallIcon, and by FCM for system-shown notifications)
// and tint it brand amber.
const DENSITIES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
const AMBER = '#F59E0B';

module.exports = function withNotificationIcon(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const res = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/res');
      for (const d of DENSITIES) {
        const dir = path.join(res, `drawable-${d}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(
          path.join(root, `assets/icons/notification/ic_notification-${d}.png`),
          path.join(dir, 'ic_notification.png')
        );
      }
      const values = path.join(res, 'values');
      fs.mkdirSync(values, { recursive: true });
      fs.writeFileSync(
        path.join(values, 'kushi_notification.xml'),
        `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="kushi_notification">${AMBER}</color>\n</resources>\n`
      );
      return cfg;
    },
  ]);

  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application[0];
    application['meta-data'] = application['meta-data'] || [];
    const name = 'com.google.firebase.messaging.default_notification_icon';
    if (!application['meta-data'].some((m) => m.$['android:name'] === name)) {
      application['meta-data'].push({ $: { 'android:name': name, 'android:resource': '@drawable/ic_notification' } });
    }
    return cfg;
  });
};
