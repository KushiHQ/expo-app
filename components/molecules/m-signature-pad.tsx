import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { PenLine, RotateCcw } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedProps,
  useSharedValue,
} from "react-native-reanimated";
import { Path, Rect, Svg } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Point = { x: number; y: number };

// Chaikin's corner-cutting algorithm — each iteration rounds corners by
// inserting two new points at 1/4 and 3/4 of every segment.
// 2 iterations is the sweet spot for signature smoothness without over-rounding.
function chaikin(pts: Point[], iterations = 2): Point[] {
  if (pts.length < 3) return pts;
  let p = pts;
  for (let iter = 0; iter < iterations; iter++) {
    const out: Point[] = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      out.push({
        x: 0.75 * p[i].x + 0.25 * p[i + 1].x,
        y: 0.75 * p[i].y + 0.25 * p[i + 1].y,
      });
      out.push({
        x: 0.25 * p[i].x + 0.75 * p[i + 1].x,
        y: 0.25 * p[i].y + 0.75 * p[i + 1].y,
      });
    }
    out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}

function pointsToPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} l 0.5 0.5`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  return d;
}

interface Props {
  onSave: (base64DataUrl: string) => void;
  existingUrl?: string;
  uploading?: boolean;
}

const SignaturePad: React.FC<Props> = ({ onSave, existingUrl, uploading }) => {
  const colors = useThemeColors();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [completedPaths, setCompletedPaths] = React.useState<string[]>([]);
  const svgRef = React.useRef<any>(null);
  // Raw points accumulated on the JS thread alongside the worklet path —
  // used for Chaikin smoothing when the stroke ends.
  const rawPoints = React.useRef<Point[]>([]);

  // Current in-progress stroke runs entirely on the UI thread via worklet
  const currentD = useSharedValue("");
  const prevX = useSharedValue(0);
  const prevY = useSharedValue(0);

  const startStroke = React.useCallback((x: number, y: number) => {
    rawPoints.current = [{ x, y }];
  }, []);

  const pushPoint = React.useCallback((x: number, y: number) => {
    rawPoints.current.push({ x, y });
  }, []);

  const commitSmoothed = React.useCallback(() => {
    const pts = rawPoints.current;
    rawPoints.current = [];
    if (pts.length === 0) return;
    // Apply Chaikin's smoothing then convert to SVG path
    setCompletedPaths((prev) => [...prev, pointsToPath(chaikin(pts))]);
  }, []);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart((e) => {
      "worklet";
      currentD.value = `M ${e.x} ${e.y}`;
      prevX.value = e.x;
      prevY.value = e.y;
      runOnJS(startStroke)(e.x, e.y);
    })
    .onUpdate((e) => {
      "worklet";
      // Skip micro-movements under 3px — eliminates finger jitter
      const dx = e.x - prevX.value;
      const dy = e.y - prevY.value;
      if (dx * dx + dy * dy < 9) return;
      // Quadratic bezier through midpoints for real-time display on UI thread
      const mx = (prevX.value + e.x) / 2;
      const my = (prevY.value + e.y) / 2;
      currentD.value = `${currentD.value} Q ${prevX.value} ${prevY.value} ${mx} ${my}`;
      prevX.value = e.x;
      prevY.value = e.y;
      runOnJS(pushPoint)(e.x, e.y);
    })
    .onEnd(() => {
      "worklet";
      currentD.value = "";
      runOnJS(commitSmoothed)();
    })
    .onFinalize(() => {
      "worklet";
      // Safety net for gesture cancellation (finger lifted outside bounds, etc.)
      currentD.value = "";
      runOnJS(commitSmoothed)();
    });

  const currentAnimatedProps = useAnimatedProps(() => ({
    d: currentD.value,
  }));

  const handleClear = () => {
    setCompletedPaths([]);
    currentD.value = "";
    rawPoints.current = [];
  };

  const handleOpen = () => {
    handleClear();
    setModalOpen(true);
  };

  const handleSave = () => {
    if (completedPaths.length === 0) return;
    // react-native-svg's toDataURL renders through the SVG library's own pipeline,
    // so strokes are always captured — unlike view-shot which misses SVG layers.
    svgRef.current?.toDataURL((data: string) => {
      onSave(`data:image/png;base64,${data}`);
      setModalOpen(false);
    });
  };

  const isEmpty = completedPaths.length === 0;

  return (
    <>
      <View style={styles.triggerSection}>
        <Text style={[styles.label, { color: colors.text }]}>Signature</Text>

        {existingUrl ? (
          <View style={styles.previewWrap}>
            <View
              style={[
                styles.previewCanvas,
                { borderColor: hexToRgba(colors.primary, 0.3) },
              ]}
            >
              <Image
                source={{ uri: existingUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="contain"
                transition={300}
                placeholder={{ blurhash: PROPERTY_BLURHASH }}
                priority="high"
              />
            </View>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={handleOpen}
              activeOpacity={0.7}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <RotateCcw
                    size={13}
                    color={hexToRgba(colors.text, 0.5)}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.retakeText,
                      { color: hexToRgba(colors.text, 0.5) },
                    ]}
                  >
                    Retake signature
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.drawCta,
              {
                backgroundColor: hexToRgba(colors.primary, 0.06),
                borderColor: hexToRgba(colors.primary, 0.25),
              },
            ]}
            onPress={handleOpen}
            activeOpacity={0.75}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <View
                  style={[
                    styles.ctaIconWrap,
                    { backgroundColor: hexToRgba(colors.primary, 0.12) },
                  ]}
                >
                  <PenLine size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={[styles.ctaLabel, { color: colors.primary }]}>
                  Draw Signature
                </Text>
                <Text
                  style={[
                    styles.ctaSub,
                    { color: hexToRgba(colors.text, 0.4) },
                  ]}
                >
                  Tap to open signature pad
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalOpen(false)}
        statusBarTranslucent
      >
        {/* GestureHandlerRootView is required for GestureDetector inside a Modal */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView
            style={[styles.modalRoot, { backgroundColor: colors.background }]}
          >
            <StatusBar barStyle="light-content" />

            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: hexToRgba(colors.text, 0.08) },
              ]}
            >
              <TouchableOpacity
                onPress={() => setModalOpen(false)}
                hitSlop={12}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: hexToRgba(colors.text, 0.5) },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Draw Signature
              </Text>
              <TouchableOpacity onPress={handleClear} hitSlop={12}>
                <Text
                  style={[
                    styles.clearText,
                    { color: hexToRgba(colors.text, 0.5) },
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.instruction,
                { color: hexToRgba(colors.text, 0.45) },
              ]}
            >
              Sign your name using your finger in the area below
            </Text>

            <GestureDetector gesture={pan}>
              <View
                style={[
                  styles.canvasOuter,
                  { borderColor: hexToRgba(colors.primary, 0.2) },
                ]}
              >
                <View style={styles.canvasInner}>
                  <Svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    style={styles.svg}
                  >
                    {/* White fill ensures the exported PNG has a white background, not transparent */}
                    <Rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="#ffffff"
                    />
                    {completedPaths.map((d, i) => (
                      <Path
                        key={i}
                        d={d}
                        stroke="#1a1a1a"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    ))}
                    {/* Current stroke lives entirely on the UI thread — no JS re-render per point */}
                    <AnimatedPath
                      animatedProps={currentAnimatedProps}
                      stroke="#1a1a1a"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>

                  {isEmpty && (
                    <View style={styles.placeholder} pointerEvents="none">
                      <PenLine
                        size={28}
                        color="rgba(0,0,0,0.18)"
                        strokeWidth={1.5}
                      />
                      <Text style={styles.placeholderText}>Sign here</Text>
                    </View>
                  )}
                </View>
              </View>
            </GestureDetector>

            <View style={styles.modalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: isEmpty
                      ? hexToRgba(colors.primary, 0.35)
                      : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={handleSave}
                disabled={isEmpty}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Signature</Text>
                )}
              </Pressable>
            </View>
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerSection: {
    marginTop: 16,
    gap: 10,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  previewWrap: {
    gap: 8,
  },
  previewCanvas: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    overflow: "hidden",
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
  },
  retakeText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  drawCta: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  ctaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  ctaLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
  },
  ctaSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  modalRoot: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  modalTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
  },
  clearText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  instruction: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  canvasOuter: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  canvasInner: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  svg: {
    flex: 1,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "rgba(0,0,0,0.2)",
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 12,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    color: "#ffffff",
  },
});

export default SignaturePad;
