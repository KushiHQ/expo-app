import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from "@/lib/constants/navigation";
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={STACK_SCREEN_OPTIONS}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="folders" options={{ headerShown: false }} />
      <Stack.Screen name="form" options={{ headerShown: false }} />
      <Stack.Screen name="map" options={{ headerShown: false }} />
    </Stack>
  );
}
