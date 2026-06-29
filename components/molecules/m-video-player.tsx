import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useEvent, useEventListener } from 'expo';
import { VideoView, type VideoPlayer, type VideoContentFit } from 'expo-video';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 14;
const HIDE_DELAY = 2800;

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

type Props = {
  player: VideoPlayer;
  /** Container shape — pass aspectRatio / width / height here. */
  style?: StyleProp<ViewStyle>;
  contentFit?: VideoContentFit;
};

/**
 * Kushi-themed video player. Renders expo-video with `nativeControls={false}`
 * and a custom overlay (center play/pause, tap-to-toggle, amber scrubber) so the
 * controls look and behave identically on Android and iOS.
 */
export default function VideoPlayerView({ player, style, contentFit = 'contain' }: Props) {
  const colors = useThemeColors();

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { currentTime } = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: player.bufferedPosition,
  });

  const [ended, setEnded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubFrac, setScrubFrac] = useState(0);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const widthRef = useRef(0);

  const duration = player.duration || 0;
  const loading = status === 'loading';
  const frac = scrubbing
    ? scrubFrac
    : duration > 0
      ? Math.min(currentTime / duration, 1)
      : 0;

  useEffect(() => {
    player.timeUpdateEventInterval = 0.25;
  }, [player]);

  useEventListener(player, 'playToEnd', () => setEnded(true));

  const clearHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Auto-hide controls a few seconds after playback starts.
  const scheduleHide = useCallback(() => {
    clearHide();
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
  }, [clearHide]);

  useEffect(() => {
    if (isPlaying && controlsVisible && !scrubbing) scheduleHide();
    else clearHide();
    return clearHide;
  }, [isPlaying, controlsVisible, scrubbing, scheduleHide, clearHide]);

  const showControls = useCallback(() => setControlsVisible(true), []);

  const togglePlay = useCallback(() => {
    if (ended) {
      player.currentTime = 0;
      setEnded(false);
      player.play();
      return;
    }
    if (isPlaying) player.pause();
    else player.play();
  }, [ended, isPlaying, player]);

  const onTapVideo = useCallback(() => {
    setControlsVisible((v) => !v);
  }, []);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setTrackWidth(w);
  }, []);

  const beginScrub = useCallback(
    (x: number) => {
      clearHide();
      setScrubbing(true);
      const w = widthRef.current || 1;
      setScrubFrac(Math.max(0, Math.min(x / w, 1)));
    },
    [clearHide],
  );

  const moveScrub = useCallback((x: number) => {
    const w = widthRef.current || 1;
    setScrubFrac(Math.max(0, Math.min(x / w, 1)));
  }, []);

  const endScrub = useCallback(
    (x: number) => {
      const w = widthRef.current || 1;
      const f = Math.max(0, Math.min(x / w, 1));
      if (duration > 0) {
        player.currentTime = f * duration;
        if (ended && f < 1) setEnded(false);
      }
      setScrubbing(false);
      if (isPlaying) scheduleHide();
    },
    [duration, player, ended, isPlaying, scheduleHide],
  );

  // Pan over the scrubber track. onBegin handles plain taps (seek-to-tap) too.
  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => runOnJS(beginScrub)(e.x))
    .onUpdate((e) => runOnJS(moveScrub)(e.x))
    .onFinalize((e) => runOnJS(endScrub)(e.x));

  const thumbLeft = Math.max(
    0,
    Math.min(frac * trackWidth - THUMB_SIZE / 2, trackWidth - THUMB_SIZE),
  );

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit={contentFit}
        style={StyleSheet.absoluteFill}
      />

      {/* Tap layer toggles control visibility (WhatsApp-style). */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onTapVideo} />

      {/* Center play / pause / replay */}
      {loading ? (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        controlsVisible && (
          <View style={styles.center} pointerEvents="box-none">
            <Pressable
              onPress={togglePlay}
              style={[styles.playBtn, { backgroundColor: hexToRgba('#000000', 0.45) }]}
              hitSlop={12}
            >
              {ended ? (
                <RotateCcw color="#fff" size={26} />
              ) : isPlaying ? (
                <Pause color="#fff" size={26} fill="#fff" />
              ) : (
                <Play color="#fff" size={26} fill="#fff" style={{ marginLeft: 3 }} />
              )}
            </Pressable>
          </View>
        )
      )}

      {/* Bottom control bar */}
      {controlsVisible && (
        <View style={styles.bottomBar} pointerEvents="box-none">
          <ThemedText style={styles.time}>{fmt(scrubbing ? frac * duration : currentTime)}</ThemedText>

          <GestureDetector gesture={pan}>
            <View style={styles.trackHit} onLayout={onTrackLayout} onTouchStart={showControls}>
              <View style={[styles.track, { backgroundColor: hexToRgba('#ffffff', 0.3) }]} />
              <View
                style={[
                  styles.track,
                  styles.fill,
                  { width: frac * trackWidth, backgroundColor: colors.primary },
                ]}
              />
              <View
                style={[
                  styles.thumb,
                  {
                    left: thumbLeft,
                    backgroundColor: colors.primary,
                    transform: [{ scale: scrubbing ? 1.25 : 1 }],
                  },
                ]}
              />
            </View>
          </GestureDetector>

          <ThemedText style={styles.time}>{fmt(duration)}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center' },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  time: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.semibold,
    width: 34,
    textAlign: 'center',
  },
  trackHit: {
    flex: 1,
    height: THUMB_SIZE + 12,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  fill: { right: undefined },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
});
