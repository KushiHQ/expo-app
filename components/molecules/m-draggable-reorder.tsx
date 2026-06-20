import * as Haptics from 'expo-haptics';
import React from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type ReorderAxis = 'x' | 'y';

export type ReorderController = {
  axis: ReorderAxis;
  /** index being dragged, or -1 when idle */
  activeIndex: SharedValue<number>;
  /** index the dragged item currently hovers over */
  targetIndex: SharedValue<number>;
  /** finger delta along the axis for the active item */
  translation: SharedValue<number>;
  /** measured slot size (incl. gap) of the active item */
  activeSize: SharedValue<number>;
  /** measured slot sizes (incl. gap) per index */
  sizes: SharedValue<number[]>;
  /** live item count, used to clamp the hover target */
  count: SharedValue<number>;
  /** true once the finger lifted cleanly, so onFinalize won't double-reset */
  released: SharedValue<boolean>;
  /** fallback slot size (incl. gap) used until onLayout reports real sizes */
  estimatedSize: number;
  setSize: (index: number, size: number) => void;
  commit: (from: number, to: number) => void;
  enabled: boolean;
};

/**
 * Coordinates a long-press drag-to-reorder over a single-axis list. Create one
 * controller per list and wrap each row/cell in <DraggableItem controller index>.
 * The dragged item floats with the finger; siblings reflow to open a gap; the
 * order is committed once on release (optimistic + persist handled by onReorder).
 */
export function useReorderController(params: {
  axis?: ReorderAxis;
  count: number;
  /** approximate slot size (incl. gap); a robust fallback before onLayout */
  estimatedSize?: number;
  onReorder: (from: number, to: number) => void;
  enabled?: boolean;
}): ReorderController {
  const axis = params.axis ?? 'y';
  const activeIndex = useSharedValue(-1);
  const targetIndex = useSharedValue(-1);
  const translation = useSharedValue(0);
  const activeSize = useSharedValue(0);
  const sizes = useSharedValue<number[]>([]);
  const count = useSharedValue(params.count);
  count.value = params.count;
  const released = useSharedValue(false);

  // Keep the latest callback without rebuilding `commit` each render.
  const onReorderRef = React.useRef(params.onReorder);
  onReorderRef.current = params.onReorder;

  const setSize = React.useCallback(
    (index: number, size: number) => {
      const next = [...sizes.value];
      next[index] = size;
      sizes.value = next;
    },
    [sizes],
  );

  const commit = React.useCallback((from: number, to: number) => {
    if (from !== to && from >= 0 && to >= 0) onReorderRef.current(from, to);
  }, []);

  return {
    axis,
    activeIndex,
    targetIndex,
    translation,
    activeSize,
    sizes,
    count,
    released,
    estimatedSize: params.estimatedSize ?? 80,
    setSize,
    commit,
    enabled: params.enabled ?? true,
  };
}

const triggerHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

type DraggableItemProps = {
  controller: ReorderController;
  index: number;
  /** spacing between items along the axis; folded into the measured slot size */
  gap?: number;
  longPressMs?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const DraggableItem: React.FC<DraggableItemProps> = ({
  controller,
  index,
  gap = 0,
  longPressMs = 250,
  style,
  children,
}) => {
  const { axis, activeIndex, targetIndex, translation, activeSize, sizes, count, released, estimatedSize, setSize, commit, enabled } =
    controller;

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .activateAfterLongPress(longPressMs)
        .onStart(() => {
          'worklet';
          activeIndex.value = index;
          targetIndex.value = index;
          activeSize.value = sizes.value[index] || estimatedSize;
          translation.value = 0;
          released.value = false;
          runOnJS(triggerHaptic)();
        })
        .onUpdate((e) => {
          'worklet';
          const t = axis === 'y' ? e.translationY : e.translationX;
          translation.value = t;

          const s = sizes.value;
          const n = count.value;
          let restStart = 0;
          for (let k = 0; k < index; k++) restStart += s[k] || estimatedSize;
          const center = restStart + t + activeSize.value / 2;

          let acc = 0;
          let idx = n - 1;
          for (let k = 0; k < n; k++) {
            const size = s[k] || estimatedSize;
            if (center < acc + size / 2) {
              idx = k;
              break;
            }
            acc += size;
          }
          targetIndex.value = idx;
        })
        .onEnd(() => {
          'worklet';
          released.value = true;
          runOnJS(commit)(activeIndex.value, targetIndex.value);
          activeIndex.value = -1;
          targetIndex.value = -1;
          translation.value = 0;
        })
        .onFinalize(() => {
          'worklet';
          // Cancelled before a clean release — clear the lift.
          if (!released.value) {
            activeIndex.value = -1;
            targetIndex.value = -1;
            translation.value = 0;
          }
        }),
    [enabled, longPressMs, index, axis, activeIndex, targetIndex, translation, activeSize, sizes, count, released, estimatedSize, commit],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const active = activeIndex.value;
    if (active === -1) {
      return {
        transform: axis === 'y' ? [{ translateY: 0 }, { scale: 1 }] : [{ translateX: 0 }, { scale: 1 }],
        zIndex: 0,
      };
    }
    if (index === active) {
      // The lifted card tracks the finger directly; only the lift scale springs.
      const lift = withSpring(1.04, { damping: 16, stiffness: 260 });
      return {
        transform:
          axis === 'y'
            ? [{ translateY: translation.value }, { scale: lift }]
            : [{ translateX: translation.value }, { scale: lift }],
        zIndex: 999,
        elevation: 10,
        opacity: 0.97,
      };
    }
    // Siblings spring out of the way to open a gap at the hover target.
    const to = targetIndex.value;
    let shift = 0;
    if (active < to && index > active && index <= to) shift = -activeSize.value;
    else if (active > to && index < active && index >= to) shift = activeSize.value;
    const v = withSpring(shift, { damping: 20, stiffness: 220, mass: 0.7 });
    return { transform: axis === 'y' ? [{ translateY: v }] : [{ translateX: v }], zIndex: 0 };
  });

  const spacing: ViewStyle = axis === 'y' ? { marginBottom: gap } : { marginRight: gap };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          setSize(index, (axis === 'y' ? height : width) + gap);
        }}
        style={[spacing, style, animatedStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
