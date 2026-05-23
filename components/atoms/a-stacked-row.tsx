import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';
import ThemedText from './a-themed-text';

type Props = {
  label: string;
  value: string;
};

const StackedRow: React.FC<Props> = ({ label, value }) => {
  const colors = useThemeColors();
  return (
    <View style={{ gap: 5 }}>
      <ThemedText
        style={{
          fontSize: 10,
          color: hexToRgba(colors.text, 0.38),
          letterSpacing: 0.8,
          fontFamily: Fonts.medium,
        }}
      >
        {label.toUpperCase()}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: hexToRgba(colors.text, 0.82),
        }}
      >
        {value || '—'}
      </ThemedText>
    </View>
  );
};

export default StackedRow;
