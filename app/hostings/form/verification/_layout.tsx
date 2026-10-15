import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ ...STACK_SCREEN_OPTIONS, contentStyle: { backgroundColor: '#07080B' } }}>
      <Stack.Screen name="overview" />
      <Stack.Screen name="request" />
    </Stack>
  );
}
