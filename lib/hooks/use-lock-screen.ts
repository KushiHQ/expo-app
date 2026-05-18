import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isLockScreenLaunch) return;

    const timer = setTimeout(() => {
      if (!pathname.includes('/call/')) {
        BackHandler.exitApp();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isLockScreenLaunch, pathname]);

  return { isLockScreenLaunch };
};
