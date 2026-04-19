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
        <Trash2 size={22} color={colors.error} />
      </Pressable>

      <View className="flex-row items-center gap-2 flex-1 mx-2">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#ff4d4d",
          }}
        />
        <View style={styles.waveform}>
          {levels.map((level, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.max(3, level * 30),
                  backgroundColor: colors.primary,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={[styles.time, { color: colors.text }]}>
        {formatTime(state.durationMillis)}
      </Text>

      <Pressable
        onPress={handleSend}
        style={[styles.sendBtn, { backgroundColor: colors.primary }]}
      >
        <Send size={18} color={colors["primary-content"]} />
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
    paddingHorizontal: 2,
  },
  iconBtn: {
    padding: 6,
  },
  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,
    height: 36,
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  time: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginRight: 8,
    fontVariant: ["tabular-nums"],
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
