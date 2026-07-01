import { Pressable } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HugeiconsStar } from '../icons/i-star';

type Props = {
  selected?: boolean;
  onSelect?: (value: string) => void;
  children: string;
};

const RatingPill: React.FC<Props> = ({ children, selected, onSelect }) => {
  const colors = useThemeColors();

  return (
    <Pressable
      className="flex-row items-center gap-2 rounded-full p-1 px-3"
      onPress={() => onSelect?.(children)}
      style={{
        backgroundColor: selected
          ? hexToRgba(colors.primary, 0.14)
          : hexToRgba(colors.text, 0.05),
      }}
    >
      <HugeiconsStar
        size={16}
        color={hexToRgba(selected ? colors['accent'] : colors['text'], 0.9)}
      />
      <ThemedText
        style={{
          fontSize: 18,
          color: hexToRgba(selected ? colors['accent'] : colors['text'], 0.9),
        }}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
};

export default RatingPill;
