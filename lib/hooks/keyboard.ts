import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

const PADDING_BOTTOM = 10;

export const useGradualKeyboardAnimation = () => {
  const height = useSharedValue(PADDING_BOTTOM);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = Math.max(e.height, PADDING_BOTTOM);
      },
      onEnd: (e) => {
        "worklet";
        height.value = e.height;
      },
    },
    [],
  );

  return { height };
};
