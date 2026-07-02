import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={STACK_SCREEN_OPTIONS}>
      <Stack.Screen name="overview" options={{ headerShown: false }} />
      <Stack.Screen name="request" options={{ headerShown: false }} />
    </Stack>
  );
}
