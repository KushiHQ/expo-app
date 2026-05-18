const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Gradle 8.14.x has a regression where it tries to package native .so files
// into lint AARs (bundleReleaseLocalLintAar), causing the build to fail for
// modules like react-native-reanimated. Pin to 8.13 which is the minimum
// version required by the AGP in use and predates the 8.14 regression.
module.exports = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const wrapperPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'gradle/wrapper/gradle-wrapper.properties',
      );
      if (fs.existsSync(wrapperPath)) {
        let contents = fs.readFileSync(wrapperPath, 'utf8');
        contents = contents.replace(
          /distributionUrl=.+/,
          'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-all.zip',
        );
        fs.writeFileSync(wrapperPath, contents);
      }
      return cfg;
    },
  ]);
