import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import React from 'react';
import { View } from 'react-native';

type Props = {
  onNext?: () => void;
};

const GettingStartedStep3: React.FC<Props> = ({ onNext }) => {
  const colors = useThemeColors();
  return (
    <View className="mt-16">
      <View className="gap-6">
        <ThemedText
          style={{ color: colors['primary'], fontSize: 28 }}
          className="text-center"
          type="title"
        >
          Rent Out Your Space with Ease
        </ThemedText>
        <ThemedText className="text-center">
          Maximize your earnings by connecting with verified guests in a few simple steps. We handle
          the complexity so you can focus on hosting.
        </ThemedText>
      </View>
      <Button onPress={onNext} type="primary" className="mt-24">
        <ThemedText content="primary">Next</ThemedText>
      </Button>
    </View>
  );
};

export default GettingStartedStep3;
