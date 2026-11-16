import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import notifee, { EventType } from '@notifee/react-native';
import { setShowWhenLocked } from 'lock-screen-manager';

export const useLockScreen = () => {
  const pathname = usePathname();
  const [isLockScreenLaunch, setIsLockScreenLaunch] = useState(false);

  // Enable lock screen display only while on a call screen.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    setShowWhenLocked(pathname.includes('/call/'));
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      notifee.getInitialNotification().then((initial) => {
        if (initial?.pressAction?.id === 'full_screen') {
          setIsLockScreenLaunch(true);
        }
      });

      const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
        if (
          (type === EventType.PRESS || type === EventType.ACTION_PRESS) &&
          detail.pressAction?.id === 'full_screen'
        ) {
          setIsLockScreenLaunch(true);
        }
      });

      return unsubscribe;
    }
  }, []);

  // Launched over the lock screen for a call: once that call screen closes, go
  // back to the lock screen. (This used to exit 500 ms after launch unless a
  // call screen was already showing, which a cold start rarely manages, so the
  // app could close itself before the call ever appeared.)
  const wasOnCall = useRef(false);
  useEffect(() => {
    if (!isLockScreenLaunch) return;
    if (pathname.includes('/call/')) {
      wasOnCall.current = true;
      return;
    }
    if (!wasOnCall.current) return;
    const timer = setTimeout(() => BackHandler.exitApp(), 500);
    return () => clearTimeout(timer);
  }, [isLockScreenLaunch, pathname]);

  return { isLockScreenLaunch };
};
