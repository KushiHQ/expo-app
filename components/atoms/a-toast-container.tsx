import { useToastStore } from '@/lib/stores/toast-store';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastItem from './a-toast-item';

const MAX_VISIBLE = 3;

// How many pixels of each older card peek above the front card
const PEEK = 18;

// Horizontal inset per step back in the stack (px each side)
const INSET = 10;

// Estimated toast height — drives the container height so nothing clips
const TOAST_H = 96;

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  // Oldest first so newest is last. slice(-MAX) keeps the latest N.
  const visible = toasts.slice(-MAX_VISIBLE);

  // reversed[0] = newest (front, bottom), reversed[N-1] = oldest (back, top-peeking)
  const reversed = [...visible].reverse();

  // Container tall enough for the front toast + PEEK strips from each older card
  const containerH = TOAST_H + (visible.length - 1) * PEEK;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 8) + 12,
        height: containerH,
      }}
    >
      {reversed.map((toast, reverseI) => {
        // reverseI 0 = newest (front): full width, full opacity, at bottom
        // reverseI 1 = second:         inset, dimmer, 1*PEEK above front
        // reverseI 2 = oldest:         most inset, dimmest, 2*PEEK above front
        const zIndex = reversed.length - reverseI;
        const bottom = reverseI * PEEK;
        const inset = reverseI * INSET;
        const opacity = reverseI === 0 ? 1 : reverseI === 1 ? 0.72 : 0.46;

        return (
          <Animated.View
            key={toast.id}
            entering={reverseI === 0 ? FadeInUp.springify().damping(20).mass(0.8) : undefined}
            style={{
              position: 'absolute',
              bottom,
              left: inset,
              right: inset,
              zIndex,
              opacity,
            }}
          >
            <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
          </Animated.View>
        );
      })}
    </View>
  );
}
