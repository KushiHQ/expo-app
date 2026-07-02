import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from '@/lib/constants/navigation';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={STACK_SCREEN_OPTIONS}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="gallery" options={{ headerShown: false }} />
      <Stack.Screen name="reservation" options={{ headerShown: false }} />
      <Stack.Screen name="booking-applications" options={{ headerShown: false }} />
    </Stack>
  );
}
