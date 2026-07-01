import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';

const SummarySection: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const colors = useThemeColors();
  return (
    <View
      className="gap-2 rounded-xl p-3"
      style={{
        backgroundColor: hexToRgba(colors.primary, 0.08),
      }}
    >
      {children}
    </View>
  );
};

export default SummarySection;
