import React from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { CheckCircle, RotateCcw, X, AlertTriangle, ChevronRight } from "lucide-react-native";
import { Fonts } from "@/lib/constants/theme";
import { useUploadStore, type ImageUploadStatus } from "@/lib/stores/uploads";

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

const ROW_META: Record<ImageUploadStatus, { label: string; color: string }> = {
  uploading: { label: "Uploading…", color: "#F59E0B" },
  queued: { label: "Waiting…", color: "#9AA0A6" },
  error: { label: "Failed — tap retry", color: "#F87171" },
  dead: { label: "Couldn't upload — remove it", color: "#9AA0A6" },
};

/**
 * App-wide room-image upload status. Floats at the top above every screen so the
 * host always knows uploads are still running (even after leaving the photo step),
 * shows a completion notice, and surfaces failures. Tap it to open a sheet with
 * per-photo state + retry/remove, and a way to clear a wedged batch (WS-2) — so a
 * stuck upload never again requires reinstalling the app.
 */
export default function UploadProgress() {
  const insets = useSafeAreaInsets();

  const tasks = useUploadStore((s) => s.tasks);
  const done = useUploadStore((s) => s.done);
  const total = useUploadStore((s) => s.total);
  const retry = useUploadStore((s) => s.retry);
  const retryAll = useUploadStore((s) => s.retryAll);
  const removeTask = useUploadStore((s) => s.removeTask);
  const clearAll = useUploadStore((s) => s.clearAll);

  const [open, setOpen] = React.useState(false);

  const list = Object.values(tasks);
  const pending = list.filter(
    (t) => t.status === "queued" || t.status === "uploading",
  ).length;
  const failed = list.filter((t) => t.status === "error" || t.status === "dead").length;

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

  // Close the sheet automatically once there's nothing left to manage.
  React.useEffect(() => {
    if (open && pending === 0 && failed === 0) setOpen(false);
  }, [open, pending, failed]);

  if (pending === 0 && failed === 0 && !showDone) return null;

  const phase = pending > 0 ? "uploading" : failed > 0 ? "error" : "done";
  const cfg = STATE[phase];
  const progress = total > 0 ? Math.min(done / total, 1) : 0;
  const canOpen = pending > 0 || failed > 0;

  const title =
    phase === "uploading"
      ? `Uploading photos${total > 0 ? ` · ${Math.min(done + 1, total)} of ${total}` : ""}`
      : phase === "error"
        ? `${failed} photo${failed === 1 ? "" : "s"} need attention`
        : "All photos uploaded";

  return (
    <>
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
          <TouchableOpacity
            activeOpacity={canOpen ? 0.85 : 1}
            onPress={() => canOpen && setOpen(true)}
            style={[styles.surface, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
          >
            <View style={[styles.iconBadge, { backgroundColor: cfg.iconBg }]}>
              {phase === "uploading" ? (
                <ActivityIndicator color={cfg.accent} size="small" />
              ) : phase === "error" ? (
                <AlertTriangle color={cfg.accent} size={16} strokeWidth={2.2} />
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
                  Tap to review, retry, or clear.
                </Text>
              ) : null}
            </View>

            {canOpen ? <ChevronRight color="rgba(148,163,184,0.7)" size={18} style={{ marginRight: 10 }} /> : null}

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
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Photo uploads</Text>
            <Text style={styles.sheetSub}>
              {pending > 0 ? `${pending} in progress` : ""}
              {pending > 0 && failed > 0 ? " · " : ""}
              {failed > 0 ? `${failed} failed` : ""}
            </Text>
          </View>

          <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {list.map((t) => {
              const meta = ROW_META[t.status];
              return (
                <View key={t.uri} style={styles.row}>
                  <Image source={{ uri: t.uri }} style={styles.thumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: meta.color }]} numberOfLines={1}>
                      {meta.label}
                    </Text>
                  </View>
                  {t.status === "error" ? (
                    <TouchableOpacity onPress={() => retry(t.uri)} hitSlop={8} style={styles.rowAction}>
                      <RotateCcw color="#F59E0B" size={18} strokeWidth={2.2} />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => removeTask(t.uri)} hitSlop={8} style={styles.rowAction}>
                    <X color="rgba(148,163,184,0.85)" size={18} strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.sheetActions}>
            {failed > 0 ? (
              <TouchableOpacity style={styles.retryAllBtn} onPress={retryAll} activeOpacity={0.85}>
                <RotateCcw color="#0A0A0A" size={16} strokeWidth={2.4} />
                <Text style={styles.retryAllLabel}>Retry failed</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                clearAll();
                setOpen(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.clearLabel}>Clear all uploads</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  // Sheet (soft/cloudy: translucent fill, no hard borders, big radius)
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16,16,16,0.98)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 14,
  },
  sheetHead: { marginBottom: 8 },
  sheetTitle: { fontFamily: Fonts.bold, fontSize: 17, color: "#F3F3F3" },
  sheetSub: { fontFamily: Fonts.regular, fontSize: 12.5, color: "#9AA0A6", marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  rowLabel: { fontFamily: Fonts.medium, fontSize: 13.5 },
  rowAction: { padding: 8 },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    paddingTop: 12,
  },
  retryAllBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFA500",
  },
  retryAllLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: "#0A0A0A" },
  clearBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.14)",
  },
  clearLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: "#F87171" },
});
