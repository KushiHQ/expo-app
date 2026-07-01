import { ToastEntry } from '@/lib/stores/toast-store';
import { Fonts } from '@/lib/constants/theme';
import { CheckCircle, Info, XCircle } from 'lucide-react-native';
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

const TYPE = {
  success: {
    bg: 'rgba(4, 20, 11, 0.96)',
    shadow: '#22C55E',
    icon: '#22C55E',
    iconBg: 'rgba(34, 197, 94, 0.13)',
    shimmer: 'rgba(34,197,94,0.07)',
  },
  error: {
    bg: 'rgba(22, 4, 4, 0.96)',
    shadow: '#EF4444',
    icon: '#EF4444',
    iconBg: 'rgba(239, 68, 68, 0.13)',
    shimmer: 'rgba(239,68,68,0.07)',
  },
  info: {
    bg: 'rgba(4, 8, 26, 0.96)',
    shadow: '#3B82F6',
    icon: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.13)',
    shimmer: 'rgba(59,130,246,0.07)',
  },
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
      <Animated.View style={animStyle}>
        {/* Glow halo */}
        <View style={[styles.glowWrap, { shadowColor: cfg.shadow }]}>
          {/* Toast surface */}
          <View style={[styles.surface, { backgroundColor: cfg.bg }]}>
            {/* Top-half glass highlight — simulates frosted reflection */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                styles.shimmerTop,
                { backgroundColor: cfg.shimmer },
              ]}
            />

            {/* Icon badge */}
            <View style={[styles.iconBadge, { backgroundColor: cfg.iconBg }]}>
              <Icon size={16} color={cfg.icon} strokeWidth={2.2} />
            </View>

            {/* Text */}
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

            {/* Action */}
            {toast.action && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  toast.action!.onPress();
                  dismiss();
                }}
                hitSlop={10}
              >
                <Text style={[styles.actionLabel, { color: cfg.icon }]}>{toast.action.label}</Text>
              </TouchableOpacity>
            )}

            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={dismissWithFade} hitSlop={10}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 10,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    minHeight: 62,
    overflow: 'hidden',
  },
  shimmerTop: {
    bottom: '50%', // only covers the top half of the toast
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
    marginRight: 10,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 4,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: '#F1F5F9',
    marginBottom: 2,
    letterSpacing: 0.15,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(148,163,184,0.9)',
    lineHeight: 17,
  },
  messageSolo: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  actionLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 11,
    color: 'rgba(148,163,184,0.5)',
    fontFamily: Fonts.medium,
  },
});
