import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const GettingStartedStep5: React.FC = () => {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <View className="mt-16">
      <View className="gap-6">
        <ThemedText
          style={{ color: colors['primary'], fontSize: 28 }}
          className="text-center"
          type="title"
        >
          Ready to Experience the Future of Living?
        </ThemedText>
        <ThemedText style={{ fontSize: 18 }} className="text-center">
          Join thousands of happy users and find your next home or start hosting today.
        </ThemedText>
      </View>
      <View className="mt-24 gap-4">
        <Button onPress={() => router.push('/auth/sign-up')} type="primary">
          <ThemedText content="primary">Sign up / Log in</ThemedText>
        </Button>
        <Button type="tinted" onPress={() => router.push('/guest/home')}>
          <ThemedText content="tinted">Explore</ThemedText>
        </Button>
      </View>
    </View>
  );
};

export default GettingStartedStep5;
