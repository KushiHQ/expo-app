import { Stack } from 'expo-router';
import React from 'react';
import AuthGuard from '@/components/guards/auth-guard';

export default function Layout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="user-details" options={{ headerShown: false }} />
        <Stack.Screen name="summary" options={{ headerShown: false }} />
        <Stack.Screen name="checkout-summary" options={{ headerShown: false }} />
        <Stack.Screen name="step-1" options={{ headerShown: false }} />
        <Stack.Screen name="step-2" options={{ headerShown: false }} />
        <Stack.Screen name="step-3" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
