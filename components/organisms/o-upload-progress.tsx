import React from "react";
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle, RotateCcw } from "lucide-react-native";
import { Fonts } from "@/lib/constants/theme";
import { useUploadStore } from "@/lib/stores/uploads";

// Matches the app's toast language (a-toast-item): frosted near-black surface,
// glow halo, tinted icon badge, slate text, colored border per state.
const STATE = {
  uploading: {
    bg: "rgba(20, 14, 2, 0.96)",
    border: "rgba(245, 165, 11, 0.30)",
    shadow: "#F59E0B",
    accent: "#F59E0B",
    iconBg: "rgba(245, 165, 11, 0.14)",
  },
  done: {
    bg: "rgba(4, 20, 11, 0.96)",
    border: "rgba(34, 197, 94, 0.28)",
    shadow: "#22C55E",
    accent: "#22C55E",
    iconBg: "rgba(34, 197, 94, 0.13)",
  },
  error: {
    bg: "rgba(22, 4, 4, 0.96)",
    border: "rgba(239, 68, 68, 0.28)",
    shadow: "#EF4444",
    accent: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.13)",
  },
} as const;

/**
 * App-wide room-image upload status. Floats at the top above every screen so the
 * host always knows uploads are still running (even after leaving the photo step),
 * shows a completion notice, and surfaces failures with a retry.
 */
export default function UploadProgress() {
  const insets = useSafeAreaInsets();

  const tasks = useUploadStore((s) => s.tasks);
  const done = useUploadStore((s) => s.done);
  const total = useUploadStore((s) => s.total);
  const retryAll = useUploadStore((s) => s.retryAll);

  const list = Object.values(tasks);
  const pending = list.filter(
    (t) => t.status === "queued" || t.status === "uploading",
  ).length;
  const failed = list.filter((t) => t.status === "error").length;

  // Briefly show "all uploaded" when the queue fully drains.
  const [showDone, setShowDone] = React.useState(false);
  const prevActive = React.useRef(0);
  React.useEffect(() => {
    const active = pending + failed;
    if (prevActive.current > 0 && active === 0) {
      setShowDone(true);
      const t = setTimeout(() => setShowDone(false), 2500);
      prevActive.current = active;
      return () => clearTimeout(t);
    }
    prevActive.current = active;
  }, [pending, failed]);

  if (pending === 0 && failed === 0 && !showDone) return null;

  const phase = pending > 0 ? "uploading" : failed > 0 ? "error" : "done";
  const cfg = STATE[phase];
  const progress = total > 0 ? Math.min(done / total, 1) : 0;

  const title =
    phase === "uploading"
      ? `Uploading photos${total > 0 ? ` · ${Math.min(done + 1, total)} of ${total}` : ""}`
      : phase === "error"
        ? `${failed} photo${failed === 1 ? "" : "s"} couldn't upload`
        : "All photos uploaded";

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 9998,
      }}
    >
      <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={[styles.glow, { shadowColor: cfg.shadow }]}>
        <View style={[styles.surface, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={[styles.iconBadge, { backgroundColor: cfg.iconBg }]}>
            {phase === "uploading" ? (
              <ActivityIndicator color={cfg.accent} size="small" />
            ) : phase === "error" ? (
              <RotateCcw color={cfg.accent} size={16} strokeWidth={2.2} />
            ) : (
              <CheckCircle color={cfg.accent} size={16} strokeWidth={2.2} />
            )}
          </View>

          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {phase === "error" ? (
              <Text style={styles.message} numberOfLines={1}>
                They won't be on your listing until they upload.
              </Text>
            ) : null}
          </View>

          {phase === "error" ? (
            <TouchableOpacity style={styles.actionBtn} onPress={retryAll} hitSlop={10}>
              <Text style={[styles.actionLabel, { color: cfg.accent }]}>Retry</Text>
            </TouchableOpacity>
          ) : null}

          {phase === "uploading" ? (
            <View style={styles.track}>
              <View
                style={{
                  height: "100%",
                  width: `${Math.max(progress * 100, 6)}%`,
                  backgroundColor: cfg.accent,
                }}
              />
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 10,
  },
  surface: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 58,
    overflow: "hidden",
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
    marginRight: 10,
    flexShrink: 0,
  },
  body: { flex: 1, paddingVertical: 12, paddingRight: 4, justifyContent: "center" },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: "#F1F5F9",
    letterSpacing: 0.15,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "rgba(148,163,184,0.9)",
    lineHeight: 17,
    marginTop: 2,
  },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 16 },
  actionLabel: { fontFamily: Fonts.semibold, fontSize: 13, letterSpacing: 0.2 },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
