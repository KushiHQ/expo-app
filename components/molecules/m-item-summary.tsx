import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";

type ItemSummaryProps = {
  label: string;
  summary: string;
};

const ItemSummary: React.FC<ItemSummaryProps> = ({ label, summary }) => {
  const colors = useThemeColors();

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
        {label}:
      </ThemedText>
      <ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}>
        {summary}
      </ThemedText>
    </View>
  );
};

export default ItemSummary;
