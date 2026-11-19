const { withAndroidManifest } = require('@expo/config-plugins');

// Google Play reads some manifest entries as hardware the app *requires* and
// hides the app from devices without it. Two come in through libraries, not
// through anything Kushi needs:
//  - android.hardware.screen.portrait: ML Kit's code scanner locks its own
//    screen to portrait (the app itself follows the phone's rotation).
//  - android.hardware.wifi: expo-network, NetInfo and blob-util ask to read
//    Wi-Fi state; the app works on mobile data alone.
// Declaring them as not required keeps every phone, tablet and Chromebook.
const OPTIONAL_FEATURES = [
  'android.hardware.screen.portrait',
  'android.hardware.screen.landscape',
  'android.hardware.wifi',
];

module.exports = function withOptionalHardware(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];
    for (const name of OPTIONAL_FEATURES) {
      let entry = manifest['uses-feature'].find((f) => f && f.$ && f.$['android:name'] === name);
      if (!entry) {
        entry = { $: { 'android:name': name } };
        manifest['uses-feature'].push(entry);
      }
      entry.$['android:required'] = 'false';
    }
    return cfg;
  });
};
