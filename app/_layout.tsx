import * as Sentry from '@sentry/react-native';
import { MODAL_SCREEN_OPTIONS } from '@/lib/constants/navigation';
import { useFonts } from 'expo-font';
import { Unbounded_500Medium, Unbounded_600SemiBold } from '@expo-google-fonts/unbounded';
import { InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { color as k } from '@/lib/k/theme';
import { Stack, useLocalSearchParams, usePathname, type ErrorBoundaryProps } from 'expo-router';
import { RouteError } from '@/components/k/route-error';
import * as SplashScreen from 'expo-splash-screen';
import { setAudioModeAsync } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import ToastContainer from '@/components/atoms/a-toast-container';
import { DialogHost } from '@/components/k/dialog';
import UploadProgress from '@/components/organisms/o-upload-progress';
import { NotificationProvider } from '@/components/contexts/notifications';
import GraphqlClientProvider from '@/components/providers/graphql-client';
import TansStackProvider from '@/components/providers/tanstack';
import { AppUpdate } from '@/components/k/app-update';
import { useLockScreen } from '@/lib/hooks/use-lock-screen';
import { initializeNotifications } from '@/lib/utils/notifications';
import React from 'react';
import { Linking, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  // Capture 100% of transactions in dev so you see everything locally.
  // In production 10% is plenty — full sampling at scale is expensive.
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  // Only enable verbose Sentry debug logs in dev (and not on Android where
  // they clutter the Metro output).
  debug: __DEV__ && Platform.OS !== 'android',
});

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

// Kushi is a night-first app: one theme, tuned for low-light reading and OLED.
const NIGHT = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: k.bg, card: k.bg, border: k.line, text: k.fg, primary: k.amber, notification: k.amber },
};

function RootLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams();

  useLockScreen();

  // Configure a baseline playback audio session on launch. Without this, every
  // expo-audio play() (message-send sound, notification sound, call ringtone,
  // voice-message playback) fires on an UNCONFIGURED iOS AVAudioSession — and if
  // the voice recorder has left the session in a record category, play() throws
  // an NSException on a background queue. RN's New-Architecture
  // convertNSExceptionToJSError then touches Hermes off the JS thread and hard-
  // crashes (SIGSEGV) instead of surfacing a catchable JS error. `playsInSilentMode`
  // also lets these UI sounds play when the ringer switch is silenced.
  React.useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isShared = params.shared === 'true';

      if (isMobile && isShared) {
        // Detect slugified hosting or reservation routes
        const isHosting = (pathname.startsWith('/homes/') || pathname.startsWith('/guest/')) && pathname.includes('___');
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
    Unbounded_500Medium,
    Unbounded_600SemiBold,
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
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
                    <ThemeProvider value={NIGHT}>
                      <Stack screenOptions={{ headerShown: false, animation: 'default', contentStyle: { backgroundColor: k.bg } }}>
                        <Stack.Screen name="camera" options={MODAL_SCREEN_OPTIONS} />
                        <Stack.Screen name="photo-gallery" options={MODAL_SCREEN_OPTIONS} />
                        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
                      </Stack>
                      <StatusBar style="light" />
                      <UploadProgress />
                      <ToastContainer />
                      <DialogHost />
                      {/* Forced/optional update — above every screen, signed in or out. */}
                      <AppUpdate />
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

// Last line of defence for any screen without its own boundary.
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteError {...props} />;
}

export default Sentry.wrap(RootLayout);
