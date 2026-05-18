import { Pressable, View } from 'react-native';
import { HugeiconsStar, MynauiStarSolid } from '../icons/i-star';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';

type Props = {
  value?: number;
  onChange?: (value: number) => void;
};

const RatingInput: React.FC<Props> = ({ onChange, value }) => {
  const colors = useThemeColors();
  const [selectedRating, setSelectedRating] = React.useState(value ?? 0);

  const handleChange = (value: number) => {
    setSelectedRating(value);
    onChange?.(value);
  };

  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Pressable key={index} onPress={() => handleChange(index + 1)}>
          {selectedRating >= index + 1 ? (
            <MynauiStarSolid size={24} color={colors.accent} />
          ) : (
            <HugeiconsStar size={24} color={colors.accent} />
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default RatingInput;
