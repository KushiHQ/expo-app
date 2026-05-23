import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';
import ThemedText from './a-themed-text';

type Props = {
  label: string;
  count?: number;
};

const Chip: React.FC<Props> = ({ label, count }) => {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: hexToRgba(colors.primary, 0.08),
        borderWidth: 1,
        borderColor: hexToRgba(colors.primary, 0.15),
      }}
    >
      <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.82) }}>{label}</ThemedText>
      {count !== undefined && (
        <View
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.22),
            borderRadius: 8,
            paddingHorizontal: 6,
            paddingVertical: 1,
          }}
        >
          <ThemedText
            style={{
              fontSize: 10,
              fontFamily: Fonts.semibold,
              color: colors.primary,
            }}
          >
            ×{count}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default Chip;
