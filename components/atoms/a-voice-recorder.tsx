import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Trash2, Send } from "lucide-react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
} from "expo-audio";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Fonts } from "@/lib/constants/theme";

type VoiceRecorderProps = {
  onSend: (uri: string) => void;
  onCancel: () => void;
};

const normalizeMetering = (db: number) => {
  const clamped = Math.max(-60, Math.min(0, db));
  return Math.max(0.05, 1 + clamped / 60);
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSend,
  onCancel,
}) => {
  const colors = useThemeColors();
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const state = useAudioRecorderState(audioRecorder, 100);
  const [levels, setLevels] = useState<number[]>(Array(30).fill(0.05));

  useEffect(() => {
    const startRecording = async () => {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        if (!perm.granted) {
          onCancel();
          return;
        }
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
      } catch (err) {
        console.error("Failed to start recording:", err);
        onCancel();
      }
    };
    startRecording();
  }, [audioRecorder, onCancel]);

  useEffect(() => {
    if (state.isRecording && typeof state.metering === "number") {
      const level = normalizeMetering(state.metering);
      setLevels((prev) => {
        const next = [...prev, level];
        return next.slice(-30);
      });
    }
  }, [state.metering, state.isRecording]);

  const handleSend = async () => {
    try {
      if (state.isRecording) {
        await audioRecorder.stop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (state.url) {
        onSend(state.url);
      }
    }
  };

  const handleCancel = async () => {
    try {
      if (state.isRecording) {
        await audioRecorder.stop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      onCancel();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleCancel} style={styles.iconBtn}>
        <Trash2 size={24} color={colors.error} />
      </Pressable>

      <View style={styles.waveform}>
        {levels.map((level, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: Math.max(4, level * 36),
                backgroundColor: colors.primary,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.time, { color: colors.text }]}>
        {formatTime(state.durationMillis)}
      </Text>

      <Pressable
        onPress={handleSend}
        style={[styles.sendBtn, { backgroundColor: colors.primary }]}
      >
        <Send size={20} color={colors["primary-content"]} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 4,
  },
  iconBtn: {
    padding: 8,
  },
  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: 40,
    marginHorizontal: 12,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  time: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginRight: 12,
    fontVariant: ["tabular-nums"],
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
