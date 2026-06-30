import { Stack } from 'expo-router';
import { STACK_SCREEN_OPTIONS } from "@/lib/constants/navigation";
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ ...STACK_SCREEN_OPTIONS, headerShown: false }}>
      <Stack.Screen name="voice" options={{ headerShown: false }} />
      <Stack.Screen name="video" options={{ headerShown: false }} />
    </Stack>
  );
}
