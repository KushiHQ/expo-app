const {
  withDangerousMod,
  withXcodeProject,
  withPlugins,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const withAndroidCustomSound = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resPath = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "raw",
      );

      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
      }

      const source = path.join(projectRoot, "assets", "audio", "ringtone.mp3");
      const destination = path.join(resPath, "ringtone.mp3");
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, destination);
      } else {
        console.warn("! Custom sound file not found at:", source);
      }

      return config;
    },
  ]);
};

const withIosCustomSound = (config) => {
  return withXcodeProject(config, async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const source = path.join(projectRoot, "assets", "audio", "ringtone.mp3");

    return config;
  });
};

module.exports = (config) => {
  return withPlugins(config, [withAndroidCustomSound, withIosCustomSound]);
};
