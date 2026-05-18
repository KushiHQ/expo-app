import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';

type Props = {
  url: string;
  isSender: boolean;
};

const WAVEFORM_BARS = [
  0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.5, 0.8, 0.9, 0.6, 0.4, 0.6, 0.8, 1.0, 0.9, 0.7, 0.5, 0.4, 0.6,
  0.8, 0.7, 0.5, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4, 0.3,
];

const AudioPlayerBubble: React.FC<Props> = ({ url, isSender }) => {
  const colors = useThemeColors();

  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const duration = status.duration || 0;
  const currentTime = status.currentTime || 0;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      if (currentTime >= duration && duration > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeColor = isSender ? colors['primary-content'] : colors.text;
  const inactiveColor = isSender
    ? hexToRgba(colors['primary-content'], 0.3)
    : hexToRgba(colors.text, 0.2);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePlayPause}
        style={[styles.playBtn, { backgroundColor: hexToRgba(activeColor, 0.15) }]}
      >
        {isPlaying ? (
          <Pause size={18} color={activeColor} fill={activeColor} />
        ) : (
          <Play size={18} color={activeColor} fill={activeColor} />
        )}
      </Pressable>

      <View style={styles.waveform}>
        {WAVEFORM_BARS.map((amp, index) => {
          const isActive = (index / WAVEFORM_BARS.length) * 100 <= progress;
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: Math.max(3, amp * 20),
                  backgroundColor: isActive ? activeColor : inactiveColor,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.time, { color: activeColor }]}>
        {formatTime(currentTime > 0 && isPlaying ? currentTime : duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 210,
    paddingVertical: 4,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  time: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontVariant: ['tabular-nums'],
    minWidth: 32,
    textAlign: 'right',
    opacity: 0.8,
  },
});

export default AudioPlayerBubble;
