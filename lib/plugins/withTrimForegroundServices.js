const { withAndroidManifest } = require('@expo/config-plugins');

// Google Play rejects foreground-service types that the system can defer
// without user impact. This app never uses background media playback or a
// connected-device service, but they get pulled into the merged manifest
// transitively (e.g. expo-audio ships FOREGROUND_SERVICE_MEDIA_PLAYBACK + a
// `mediaPlayback` AudioControlsService). Strip them from the MERGED manifest
// with tools:node="remove" so the Play permission/service scan is clean.
const REMOVE_PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
  'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
];

const REMOVE_SERVICES = [
  // expo-audio's media3 MediaSessionService (foregroundServiceType="mediaPlayback")
  'expo.modules.audio.service.AudioControlsService',
];

module.exports = function withTrimForegroundServices(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // Remove unwanted foreground-service permissions from the merged manifest.
    manifest['uses-permission'] = manifest['uses-permission'] || [];
    for (const name of REMOVE_PERMISSIONS) {
      let entry = manifest['uses-permission'].find((p) => p && p.$ && p.$['android:name'] === name);
      if (!entry) {
        entry = { $: { 'android:name': name } };
        manifest['uses-permission'].push(entry);
      }
      entry.$['tools:node'] = 'remove';
    }

    // Remove the media-playback service the app doesn't use.
    const application = manifest.application && manifest.application[0];
    if (application) {
      application.service = application.service || [];
      for (const name of REMOVE_SERVICES) {
        let svc = application.service.find((s) => s && s.$ && s.$['android:name'] === name);
        if (!svc) {
          svc = { $: { 'android:name': name } };
          application.service.push(svc);
        }
        svc.$['tools:node'] = 'remove';
      }
    }

    return cfg;
  });
};
