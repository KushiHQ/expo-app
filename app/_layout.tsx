import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useLocalSearchParams, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import toastConfig from '@/components/atoms/a-toast';
import { NotificationProvider } from '@/components/contexts/notifications';
import GraphqlClientProvider from '@/components/providers/graphql-client';
import TansStackProvider from '@/components/providers/tanstack';
import { Fonts } from '@/lib/constants/theme';
import { useColorScheme } from '@/lib/hooks/use-color-scheme';
import { useLockScreen } from '@/lib/hooks/use-lock-screen';
import { initializeNotifications } from '@/lib/utils/notifications';
import React from 'react';
import { Linking, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../global.css';

SplashScreen.preventAutoHideAsync();

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

LogBox.ignoreLogs([
  'AddIceCandidate failed because the session was shut down',
  'Illegal State: call.join() shall be called only once',
  "The screen 'index' was removed natively but didn't get removed from JS state",
]);

initializeNotifications();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  useLockScreen();

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isShared = params.shared === 'true';

      if (isMobile && isShared) {
        // Detect slugified hosting or reservation routes
        const isHosting = pathname.startsWith('/guest/') && pathname.includes('___');
        const isReservation = pathname.includes('/reservation/');

        if (isHosting || isReservation) {
          // For slugified hosting, we need to extract the ID from the end (___ID)
          let deepLink = `kushi://${pathname.substring(1)}`;

          if (isHosting && !isReservation) {
            const id = pathname.split('___').pop();
            deepLink = `kushi://hostings/${id}`;
          }

          const queryParams = { ...params };
          delete queryParams.shared; // Remove shared from deep link

          const finalDeepLink = `${deepLink}${
            Object.keys(queryParams).length
              ? `?${new URLSearchParams(queryParams as any).toString()}`
              : ''
          }`;

          setTimeout(() => {
            Linking.openURL(finalDeepLink).catch(() => {});
          }, 1000);
        }
      }
    }
  }, [pathname, params]);
  const [loaded, error] = useFonts({
    [Fonts.thin]: Inter_100Thin,
    [Fonts.extralight]: Inter_200ExtraLight,
    [Fonts.light]: Inter_300Light,
    [Fonts.regular]: Inter_400Regular,
    [Fonts.medium]: Inter_500Medium,
    [Fonts.semibold]: Inter_600SemiBold,
    [Fonts.bold]: Inter_700Bold,
    [Fonts.extrabold]: Inter_800ExtraBold,
    [Fonts.black]: Inter_900Black,
    TwemojiMozilla: require('react-native-country-select/lib/assets/fonts/TwemojiMozilla.woff2'),
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <GraphqlClientProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <TansStackProvider>
              <PaperProvider>
                <SafeAreaProvider>
                  <NotificationProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                      <Stack screenOptions={{ animation: 'default' }}>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                        <Stack.Screen name="guest" options={{ headerShown: false }} />
                        <Stack.Screen name="host" options={{ headerShown: false }} />
                        <Stack.Screen name="camera" options={{ headerShown: false }} />
                        <Stack.Screen name="photo-gallery" options={{ headerShown: false }} />
                        <Stack.Screen name="hostings" options={{ headerShown: false }} />
                        <Stack.Screen name="kyc" options={{ headerShown: false }} />
                        <Stack.Screen name="bookings" options={{ headerShown: false }} />
                        <Stack.Screen name="chats" options={{ headerShown: false }} />
                        <Stack.Screen name="users" options={{ headerShown: false }} />
                        <Stack.Screen name="logout" options={{ headerShown: false }} />
                      </Stack>
                      <StatusBar style="auto" />
                      <Toast config={toastConfig} />
                    </ThemeProvider>
                  </NotificationProvider>
                </SafeAreaProvider>
              </PaperProvider>
            </TansStackProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </GraphqlClientProvider>
    </>
  );
}
