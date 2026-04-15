import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

export const useGradualKeyboardAnimation = () => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = e.height;
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
