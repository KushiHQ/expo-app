import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Modal, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import VideoPlayerView from '@/components/molecules/m-video-player';
import ImageScrim from '@/components/atoms/a-image-scrim';
import ThemedText from '@/components/atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

type Props = {
  /** Video URL or local file URI. */
  source: string;
  durationSeconds?: number;
  /** Caption shown on the poster, e.g. "Property tour". */
  title?: string;
  /** Card shape — pass aspectRatio / width / height here. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Tappable video poster that opens an immersive fullscreen player. The poster is
 * the paused first frame; tapping plays the clip fullscreen (portrait, TikTok-style)
 * using the shared Kushi-themed VideoPlayerView. Reused on the hosting form and the
 * hosting-details gallery.
 */
export default function VideoCard({ source, durationSeconds, title, style }: Props) {
  const [open, setOpen] = useState(false);

  const player = useVideoPlayer(source, (p) => {
    p.muted = false;
    p.pause();
  });
  useEffect(() => {
    player.replace(source);
  }, [source, player]);

  const duration = durationSeconds || player.duration || 0;

  const openFull = useCallback(() => {
    player.currentTime = 0;
    setOpen(true);
    player.play();
  }, [player]);

  const closeFull = useCallback(() => {
    player.pause();
    player.currentTime = 0;
    setOpen(false);
  }, [player]);

  return (
    <>
      <View style={[styles.card, style]}>
        {/* While fullscreen is open the poster surface is released so the modal
            owns the single video surface (avoids Android dual-surface flicker). */}
        {open ? (
          <View style={StyleSheet.absoluteFill} />
        ) : (
          <VideoView
            player={player}
            nativeControls={false}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
          />
        )}

        <View
          style={[styles.scrim, { backgroundColor: hexToRgba('#000000', 0.15) }]}
          pointerEvents="none"
        />
        <ImageScrim from="bottom" intensity={0.5} height="55%" />

        <View style={styles.center} pointerEvents="none">
          <View style={[styles.playBtn, { backgroundColor: hexToRgba('#000000', 0.5) }]}>
            <Play color="#fff" size={26} fill="#fff" style={{ marginLeft: 3 }} />
          </View>
        </View>

        {(title || duration > 0) && (
          <View style={styles.metaRow} pointerEvents="none">
            {title ? (
              <ThemedText style={styles.title} numberOfLines={1}>
                {title}
              </ThemedText>
            ) : (
              <View />
            )}
            {duration > 0 ? (
              <View style={[styles.badge, { backgroundColor: hexToRgba('#000000', 0.55) }]}>
                <ThemedText style={styles.badgeText}>{fmt(duration)}</ThemedText>
              </View>
            ) : null}
          </View>
        )}

        {/* Top tap layer — the native video surface swallows touches, so capture
            the press above everything else. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={openFull} />
      </View>

      <Modal visible={open} animationType="fade" onRequestClose={closeFull} statusBarTranslucent>
        {/* A SafeAreaProvider nested INSIDE the Modal is required — the root
            provider's insets are wrong for a translucent full-screen modal, so
            the close button used to land under the notch on some phones. */}
        <SafeAreaProvider>
          <View style={styles.fullRoot}>
            <StatusBar style="light" />
            <VideoPlayerView
              player={player}
              contentFit="contain"
              style={StyleSheet.absoluteFill}
              title={title}
              onClose={closeFull}
            />
          </View>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.semibold,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: Fonts.semibold },
  fullRoot: { flex: 1, backgroundColor: '#000' },
});
