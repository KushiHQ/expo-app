import { Stack } from 'expo-router';
import React from 'react';
import AuthGuard from '@/components/guards/auth-guard';

export default function Layout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking-applications" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
