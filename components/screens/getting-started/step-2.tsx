import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import React from 'react';
import { View } from 'react-native';

type Props = {
  onNext?: () => void;
};

const GettingStartedStep2: React.FC<Props> = ({ onNext }) => {
  const colors = useThemeColors();
  return (
    <View className="mt-16">
      <View className="gap-6">
        <ThemedText
          style={{ color: colors['primary'], fontSize: 28 }}
          className="text-center"
          type="title"
        >
          Find Your Perfect Home in Minutes
        </ThemedText>
        <ThemedText className="text-center">
          Tailored searches and smart filters help you discover a space that fits your lifestyle and
          budget perfectly.
        </ThemedText>
      </View>
      <Button onPress={onNext} type="primary" className="mt-16">
        <ThemedText content="primary">Next</ThemedText>
      </Button>
    </View>
  );
};

export default GettingStartedStep2;
