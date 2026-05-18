import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View } from 'react-native';
import ThemedText from './a-themed-text';
import { Fonts } from '@/lib/constants/theme';

type Props = {
  steps: number;
  currentStep: number;
  titles?: string[];
};

const Stepper: React.FC<Props> = ({ steps, currentStep, titles }) => {
  const colors = useThemeColors();

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <ThemedText style={{ fontSize: 11, fontFamily: Fonts.medium }}>
          {titles?.at(currentStep - 1)}
        </ThemedText>
        <View className="flex-row items-center gap-0.5">
          <ThemedText
            style={{
              fontSize: 11,
              color: colors.primary,
              fontFamily: Fonts.medium,
            }}
          >
            Step {currentStep}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 11,
              fontFamily: Fonts.medium,
            }}
          >
            /{steps}
          </ThemedText>
        </View>
      </View>
      <View className="flex-row gap-2">
        {Array.from({ length: steps }).map((_, index) => (
          <View
            key={index}
            className="h-1 flex-1 rounded-full"
            style={{
              backgroundColor:
                index + 1 <= currentStep ? colors.primary : hexToRgba(colors.primary, 0.2),
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default Stepper;
