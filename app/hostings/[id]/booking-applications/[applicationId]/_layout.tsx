import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ animation: 'fade' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
