import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';
import ThemedText from './a-themed-text';

type Props = {
  label: string;
  value: string;
  accent?: boolean;
};

const DataRow: React.FC<Props> = ({ label, value, accent }) => {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <ThemedText
        style={{
          fontSize: 12,
          color: hexToRgba(colors.text, 0.4),
          width: 112,
          flexShrink: 0,
          paddingTop: 1,
        }}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 13,
          flex: 1,
          color: accent ? colors.primary : hexToRgba(colors.text, 0.9),
          fontFamily: accent ? Fonts.semibold : Fonts.regular,
        }}
      >
        {value || '—'}
      </ThemedText>
    </View>
  );
};

export default DataRow;
