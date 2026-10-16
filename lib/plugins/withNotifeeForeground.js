const { withAndroidManifest } = require('@expo/config-plugins');

// The app no longer runs a Notifee foreground service: incoming calls ring
// through a full-screen call notification, and calls in progress use Daily's
// own camera/microphone service. Remove Notifee's service from the merged
// manifest so Google Play doesn't see an unused foreground-service type.
module.exports = function withNotifeeForeground(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const application = manifest.application[0];
    application.service = application.service || [];
    let svc = application.service.find((s) => s && s.$ && s.$['android:name'] === 'app.notifee.core.ForegroundService');
    if (!svc) {
      svc = { $: { 'android:name': 'app.notifee.core.ForegroundService' } };
      application.service.push(svc);
    }
    svc.$ = { 'android:name': 'app.notifee.core.ForegroundService', 'tools:node': 'remove' };
    return cfg;
  });
};
