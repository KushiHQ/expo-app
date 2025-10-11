import { Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
  selected?: boolean;
  onSelect?: (value: string) => void;
  children: string;
};

const TextPill: React.FC<Props> = ({ children, selected, onSelect }) => {
  const colors = useThemeColors();

  return (
    <Pressable onPress={() => onSelect?.(children)}>
      <ThemedText
        className="border p-1 px-3 rounded-full"
        style={{
          fontSize: 14,
          backgroundColor: selected ? colors["text"] : colors["background"],
          color: hexToRgba(
            selected ? colors["background"] : colors["text"],
            0.9,
          ),
          borderColor: hexToRgba(colors["shade"], 0.9),
        }}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
};

export default TextPill;
