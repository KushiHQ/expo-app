import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { View } from "react-native";

const SummarySection: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const colors = useThemeColors();
  return (
    <View
      className="p-3 rounded-xl gap-2"
      style={{
        borderWidth: 2,
        borderColor: hexToRgba(colors.primary, 0.08),
        backgroundColor: hexToRgba(colors.primary, 0.08),
      }}
    >
      {children}
    </View>
  );
};

export default SummarySection;
