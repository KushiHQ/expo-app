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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvent, useEventListener } from 'expo';
import { VideoView, type VideoPlayer, type VideoContentFit } from 'expo-video';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import ImageScrim from '@/components/atoms/a-image-scrim';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';

const TRACK_HEIGHT = 5;
const THUMB_SIZE = 15;
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
  /** Fullscreen chrome: when `onClose` is set, a safe-area top bar with the
   *  title and a close button is rendered over the video. */
  title?: string;
  onClose?: () => void;
};

/**
 * Kushi-themed video player. Renders expo-video with `nativeControls={false}`
 * and a custom, soft/cloudy overlay: gradient scrims, a frosted center
 * play/pause, an amber scrubber, and (in fullscreen) a safe-area top bar with
 * the title + close button — identical on Android and iOS.
 */
export default function VideoPlayerView({
  player,
  style,
  contentFit = 'contain',
  title,
  onClose,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const fullscreen = !!onClose;

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
  const frac = scrubbing ? scrubFrac : duration > 0 ? Math.min(currentTime / duration, 1) : 0;

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

  const thumbLeft = Math.max(0, Math.min(frac * trackWidth - THUMB_SIZE / 2, trackWidth - THUMB_SIZE));

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

      {/* Top chrome (fullscreen only) — title + close, over a soft scrim. */}
      {fullscreen && controlsVisible && (
        <>
          <ImageScrim from="top" intensity={0.55} height={insets.top + 120} />
          <View
            style={[styles.topBar, { paddingTop: insets.top + 8 }]}
            pointerEvents="box-none"
          >
            {title ? (
              <ThemedText numberOfLines={1} style={styles.topTitle}>
                {title}
              </ThemedText>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              onPress={onClose}
              style={[styles.iconBtn, { backgroundColor: hexToRgba('#000000', 0.5) }]}
              hitSlop={12}
            >
              <X color="#fff" size={20} />
            </Pressable>
          </View>
        </>
      )}

      {/* Center play / pause / replay */}
      {loading ? (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        controlsVisible && (
          <View style={styles.center} pointerEvents="box-none">
            <Pressable
              onPress={togglePlay}
              style={[styles.playBtn, { backgroundColor: hexToRgba('#000000', 0.5) }]}
              hitSlop={12}
            >
              {ended ? (
                <RotateCcw color="#fff" size={30} />
              ) : isPlaying ? (
                <Pause color="#fff" size={30} fill="#fff" />
              ) : (
                <Play color="#fff" size={30} fill="#fff" style={{ marginLeft: 3 }} />
              )}
            </Pressable>
          </View>
        )
      )}

      {/* Bottom control bar over a soft scrim. */}
      {controlsVisible && (
        <>
          <ImageScrim from="bottom" intensity={0.6} height={160} />
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: (fullscreen ? insets.bottom : 0) + 14 },
            ]}
            pointerEvents="box-none"
          >
            <ThemedText style={styles.time}>
              {fmt(scrubbing ? frac * duration : currentTime)}
            </ThemedText>

            <GestureDetector gesture={pan}>
              <View style={styles.trackHit} onLayout={onTrackLayout} onTouchStart={showControls}>
                <View style={[styles.track, { backgroundColor: hexToRgba('#ffffff', 0.28) }]} />
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
                      boxShadow: '0px 0px 10px 0px rgba(245,158,11,0.7)',
                      transform: [{ scale: scrubbing ? 1.3 : 1 }],
                    },
                  ]}
                />
              </View>
            </GestureDetector>

            <ThemedText style={styles.time}>{fmt(duration)}</ThemedText>
          </View>
        </>
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
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  time: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.semibold,
    width: 38,
    textAlign: 'center',
  },
  trackHit: {
    flex: 1,
    height: THUMB_SIZE + 14,
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
