import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import ThemedText from '../atoms/a-themed-text';
import Tooltip from '../atoms/a-tooltip';
import { CircleQuestionMark } from 'lucide-react-native';

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
    <View
      className={twMerge(
        'flex-row items-center justify-between border-b p-2 py-5',
        bordered === false && 'pb-2',
      )}
      style={{
        borderColor: bordered ? hexToRgba(colors.text, 0.05) : 'transparent',
      }}
    >
      <View className="flex-row items-center gap-2">
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
  );
};

export default CheckoutSummaryItem;
