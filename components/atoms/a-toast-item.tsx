import { ToastEntry } from '@/lib/stores/toast-store';
import { color, font, radius, shadow } from '@/lib/k/theme';
import { CheckCircle, Info, X, XCircle } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Kushi night surface with a tone-coloured edge and icon, matching <Notice />
// (components/k/feedback.tsx). Colour marks the kind of message, never the
// whole surface.
const TYPE = {
  success: { fg: color.success, soft: color.successSoft },
  error: { fg: color.danger, soft: color.dangerSoft },
  info: { fg: color.signal, soft: color.signalSoft },
} as const;

const ICONS = { success: CheckCircle, error: XCircle, info: Info };

type Props = { toast: ToastEntry; onDismiss: () => void };

export default function ToastItem({ toast, onDismiss }: Props) {
  const cfg = TYPE[toast.type];
  const Icon = ICONS[toast.type];
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const dismiss = useCallback(() => onDismiss(), [onDismiss]);

  const dismissWithFade = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 }, (done) => {
      if (done) runOnJS(dismiss)();
    });
  }, [dismiss, opacity]);

  useEffect(() => {
    const t = setTimeout(dismissWithFade, toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dismissWithFade]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 80) {
        translateX.value = withSpring(
          e.translationX > 0 ? 480 : -480,
          { duration: 280 },
          (done) => {
            if (done) runOnJS(dismiss)();
          },
        );
      } else {
        translateX.value = withSpring(0, { damping: 22 });
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[animStyle, shadow]}>
        <View style={styles.surface}>
          <View style={[styles.edge, { backgroundColor: cfg.fg }]} />

          <View style={[styles.iconBadge, { backgroundColor: cfg.soft }]}>
            <Icon size={16} color={cfg.fg} strokeWidth={2.2} />
          </View>

          <View style={styles.body}>
            {toast.title ? (
              <>
                <Text style={styles.title}>{toast.title}</Text>
                <Text style={styles.message}>{toast.message}</Text>
              </>
            ) : (
              <Text style={styles.messageSolo}>{toast.message}</Text>
            )}
          </View>

          {toast.action && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                toast.action!.onPress();
                dismiss();
              }}
              hitSlop={10}
            >
              <Text style={[styles.actionLabel, { color: cfg.fg }]}>{toast.action.label}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={dismissWithFade} hitSlop={10} accessibilityLabel="Dismiss">
            <X size={15} color={color.muted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line2,
    backgroundColor: color.surface2,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
    marginRight: 12,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    paddingVertical: 13,
    paddingRight: 4,
    justifyContent: 'center',
  },
  title: {
    fontFamily: font.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: color.fg,
    marginBottom: 2,
  },
  message: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 18,
    color: color.fg2,
  },
  messageSolo: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
    color: color.fg,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  actionLabel: {
    fontFamily: font.bodySemi,
    fontSize: 14,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
});
