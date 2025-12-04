import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { View } from "react-native";

const SummarySection: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const colors = useThemeColors();
  return (
    <View
      className="p-3 rounded gap-2"
      style={{
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: hexToRgba(colors.primary, 0.4),
        backgroundColor: hexToRgba(colors.primary, 0.1),
      }}
    >
      {children}
    </View>
  );
};

export default SummarySection;
