const { withProjectBuildGradle } = require('@expo/config-plugins');

// Two consumers need different androidx.media3 versions:
//
//  - expo-video (3.0.16) / expo-audio (1.1.1) are compiled against the media3 1.8.0
//    ExoPlayer ABI. At 1.9.0, expo-video's VideoPlayerLoadControl crashes playback with
//    java.lang.AbstractMethodError: LoadControl.getAllocator(PlayerId).
//  - CameraX camera-video 1.7.0-alpha01 (pulled by react-native-vision-camera, and used by
//    expo-camera's recorder) needs media3 1.9.0 — it calls androidx.media3.muxer.MediaMuxerCompat,
//    a class that only exists in 1.9.0. At 1.8.0, recording crashes with NoClassDefFoundError.
//
// So we split the graph: the ExoPlayer family stays at 1.8.0 (expo-video's compiled ABI; the
// breaking change lived in ExoPlayer's own LoadControl), while media3-muxer and the modules it
// requires (media3-common, media3-container) go to 1.9.0 so CameraX finds MediaMuxerCompat.
// ExoPlayer 1.8.0 against the newer common is forward-compatible (1.8 -> 1.9 is additive).
const MARKER = '// kushi: split androidx.media3 (expo-video 1.8.0 vs CameraX muxer 1.9.0)';
const MUXER_19 = "['media3-muxer', 'media3-common', 'media3-container']";
const FORCE_BLOCK = `
${MARKER}
allprojects {
  configurations.all {
    resolutionStrategy.eachDependency { details ->
      if (details.requested.group == 'androidx.media3') {
        if (${MUXER_19}.contains(details.requested.name)) {
          details.useVersion '1.9.0'
          details.because 'CameraX camera-video needs media3 1.9.0 muxer (MediaMuxerCompat)'
        } else {
          details.useVersion '1.8.0'
          details.because 'expo-video is built against the media3 1.8.0 ExoPlayer ABI'
        }
      }
    }
  }
}
`;

module.exports = (config) =>
  withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        `withMedia3Version: expected a groovy build.gradle, got ${cfg.modResults.language}`,
      );
    }
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += FORCE_BLOCK;
    }
    return cfg;
  });
