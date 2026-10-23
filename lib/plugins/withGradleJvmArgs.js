const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// D8 dex merging is memory-intensive for large RN projects.
// Default Gradle JVM heap (~2 GB) causes OutOfMemoryError at mergeExtDexRelease.
// With R8 on, 4 GB ran out at packageReleaseBundle (1.4.3/1.4.4 production builds),
// and HeapDumpOnOutOfMemoryError left the JVM thrashing until the job timed out.
// CI runners have 16 GB; exit on OOM so a failure is immediate instead of a hang.
module.exports = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const gradlePropertiesPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'gradle.properties',
      );
      if (fs.existsSync(gradlePropertiesPath)) {
        let contents = fs.readFileSync(gradlePropertiesPath, 'utf8');

        const jvmArgsValue = '-Xmx6g -XX:MaxMetaspaceSize=1g -XX:+ExitOnOutOfMemoryError';

        if (contents.includes('org.gradle.jvmargs')) {
          contents = contents.replace(
            /org\.gradle\.jvmargs=.*/,
            `org.gradle.jvmargs=${jvmArgsValue}`,
          );
        } else {
          contents += `\norg.gradle.jvmargs=${jvmArgsValue}\n`;
        }

        if (contents.includes('org.gradle.daemon')) {
          contents = contents.replace(/org\.gradle\.daemon=.*/, 'org.gradle.daemon=false');
        } else {
          contents += 'org.gradle.daemon=false\n';
        }

        fs.writeFileSync(gradlePropertiesPath, contents);
      }
      return cfg;
    },
  ]);
