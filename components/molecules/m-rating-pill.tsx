import { Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { HugeiconsStar } from "../icons/i-start";

type Props = {
  selected?: boolean;
  onSelect?: (value: string) => void;
  children: string;
};

const RatingPill: React.FC<Props> = ({ children, selected, onSelect }) => {
  const colors = useThemeColors();

  return (
    <Pressable
      className="border items-center gap-2 flex-row p-1 px-3 rounded-full"
      onPress={() => onSelect?.(children)}
      style={{
        borderColor: selected
          ? hexToRgba(colors["accent"], 0.6)
          : hexToRgba(colors["text"], 0.2),
      }}
    >
      <HugeiconsStar
        size={16}
        color={hexToRgba(selected ? colors["accent"] : colors["text"], 0.9)}
      />
      <ThemedText
        style={{
          fontSize: 18,
          color: hexToRgba(selected ? colors["accent"] : colors["text"], 0.9),
        }}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
};

export default RatingPill;
