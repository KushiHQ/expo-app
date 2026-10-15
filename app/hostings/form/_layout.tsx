import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';
import React from 'react';

const SCREENS = ['index', 'onboarding', 'basics', 'photos', 'location', 'features', 'price', 'agreement', 'publish', 'verification'];
const OLD = ['step-1', 'step-2', 'step-2-video', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7', 'step-8'];

export default function Layout() {
  return (
    <Stack screenOptions={{ ...STACK_SCREEN_OPTIONS, headerShown: false, contentStyle: { backgroundColor: '#07080B' } }}>
      {SCREENS.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
      {OLD.map((name) => (
        <Stack.Screen key={name} name={name} options={{ animation: 'none' }} />
      ))}
    </Stack>
  );
}
