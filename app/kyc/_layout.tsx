import { Stack } from 'expo-router';
import React from 'react';
import AuthGuard from '@/components/guards/auth-guard';

export default function Layout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="image" options={{ headerShown: false }} />
        <Stack.Screen name="nin" options={{ headerShown: false }} />
        <Stack.Screen name="phone" options={{ headerShown: false }} />
        <Stack.Screen name="bvn" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
