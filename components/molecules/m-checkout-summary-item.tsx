import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import Tooltip from '../atoms/a-tooltip';
import { CircleQuestionMark } from 'lucide-react-native';
import SoftDivider from '../atoms/a-soft-divider';

type SummaryItemProps = {
  label: string;
  value: string;
  bordered?: boolean;
  description?: string;
  extraLarge?: boolean;
};

const CheckoutSummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  bordered = true,
  description,
  extraLarge,
}) => {
  const colors = useThemeColors();
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: bordered === false ? 8 : 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ThemedText
            type={extraLarge ? 'title' : 'semibold'}
            style={{ fontSize: extraLarge ? 20 : 16 }}
          >
            {label}
          </ThemedText>
          {description && (
            <Tooltip title={label} description={description}>
              <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
            </Tooltip>
          )}
        </View>
        <ThemedText style={{ fontSize: extraLarge ? 20 : 16 }}>{value}</ThemedText>
      </View>
      {bordered && <SoftDivider style={{ marginTop: 16 }} />}
    </View>
  );
};

export default CheckoutSummaryItem;
