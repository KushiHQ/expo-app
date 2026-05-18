import React, { FC } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

interface RatingRangeProps {
  value: number;
  max: number;
  containerStyle?: StyleProp<ViewStyle>;
  color?: string;
}

const RatingRange: FC<RatingRangeProps> = ({ value, max, containerStyle, color }) => {
  const colors = useThemeColors();

  const percentage = (value / max) * 100;
  const finalColor = color || colors.primary;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.rangeBar,
          {
            backgroundColor: hexToRgba(finalColor, 0.2),
          },
        ]}
      >
        <View
          style={[
            styles.valueBar,
            {
              width: `${percentage}%`,
              backgroundColor: finalColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 6,
    borderRadius: 3,
  },
  rangeBar: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  valueBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default RatingRange;
