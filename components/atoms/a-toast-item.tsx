import { ToastEntry } from '@/lib/stores/toast-store';
import { Fonts } from '@/lib/constants/theme';
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

// Soft/cloudy: one neutral frosted near-black surface for every type — the
// colour is carried by the icon badge + a soft coloured glow + a faint shimmer,
// never by tinting the whole surface.
const SURFACE_BG = 'rgba(16,16,18,0.97)';

const TYPE = {
  success: {
    icon: '#34D399',
    iconBg: 'rgba(52,211,153,0.15)',
    glow: 'rgba(52,211,153,0.4)',
    shimmer: 'rgba(52,211,153,0.06)',
  },
  error: {
    icon: '#F87171',
    iconBg: 'rgba(248,113,113,0.15)',
    glow: 'rgba(248,113,113,0.4)',
    shimmer: 'rgba(248,113,113,0.06)',
  },
  info: {
    icon: '#5B8CFF',
    iconBg: 'rgba(91,140,255,0.15)',
    glow: 'rgba(91,140,255,0.38)',
    shimmer: 'rgba(91,140,255,0.06)',
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
        {/* Soft coloured glow halo */}
        <View style={[styles.glowWrap, { boxShadow: `0px 8px 26px -8px ${cfg.glow}` }]}>
          {/* Toast surface — neutral frosted near-black */}
          <View style={[styles.surface, { backgroundColor: SURFACE_BG }]}>
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
              <X size={15} color="rgba(154,160,166,0.6)" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    borderRadius: 22,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    minHeight: 62,
    overflow: 'hidden',
  },
  shimmerTop: {
    bottom: '50%', // only covers the top half of the toast
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    color: '#F3F3F3',
    marginBottom: 2,
    letterSpacing: 0.15,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#9AA0A6',
    lineHeight: 17,
  },
  messageSolo: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#EDEDED',
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
});
