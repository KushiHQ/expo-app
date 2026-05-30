import { useToastStore } from '@/lib/stores/toast-store';
import { View } from 'react-native';
import { Portal } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastItem from './a-toast-item';

const MAX_VISIBLE = 3;
const PEEK = 18;
const INSET = 10;
const TOAST_H = 96;

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  const visible = toasts.slice(-MAX_VISIBLE);
  const reversed = [...visible].reverse();
  const containerH = TOAST_H + (visible.length - 1) * PEEK;

  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: Math.max(insets.top, 8) + 12,
          height: containerH,
          zIndex: 9999,
        }}
      >
        {reversed.map((toast, reverseI) => {
          const zIndex = 9999 - reverseI;
          const top = reverseI * PEEK;
          const inset = reverseI * INSET;
          const opacity = reverseI === 0 ? 1 : reverseI === 1 ? 0.72 : 0.46;

          return (
            <Animated.View
              key={toast.id}
              entering={reverseI === 0 ? FadeInDown.springify().damping(20).mass(0.8) : undefined}
              style={{
                position: 'absolute',
                top,
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
    </Portal>
  );
}
