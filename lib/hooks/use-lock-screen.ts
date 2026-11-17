import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { setShowWhenLocked } from 'lock-screen-manager';
import { isLockScreenLaunch as lockScreenLaunch, setLockScreenLaunch } from '../call/state';
import { EventEmitter } from '../utils/event-emitter';

/**
 * Android: lets the call screen show over the lock screen, and sends the phone
 * back to its lock screen once a call that was launched from there closes.
 *
 * Whether the app was launched over the lock screen comes from the call state
 * (set when the notification's full-screen launch is handled). This hook used
 * to read Notifee's launch notification itself, which Notifee hands out only
 * once, so the notification provider's cold-start handling never saw it.
 *
 * `root`: the one instance in the root layout, which owns the exit.
 */
export const useLockScreen = ({ root = false }: { root?: boolean } = {}) => {
  const pathname = usePathname();
  const [isLockScreenLaunch, setIsLockScreenLaunch] = useState(lockScreenLaunch());

  // Enable lock screen display only while on a call screen.
  useEffect(() => {
    if (Platform.OS !== 'android' || !root) return;
    setShowWhenLocked(pathname.includes('/call/'));
  }, [pathname, root]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    setIsLockScreenLaunch(lockScreenLaunch());
    EventEmitter.on('lock_screen_launch', setIsLockScreenLaunch);
    return () => EventEmitter.off('lock_screen_launch', setIsLockScreenLaunch);
  }, []);

  // Launched over the lock screen for a call: once that call screen closes, go
  // back to the lock screen. (This used to exit 500 ms after launch unless a
  // call screen was already showing, which a cold start rarely manages, so the
  // app could close itself before the call ever appeared.)
  const wasOnCall = useRef(false);
  useEffect(() => {
    if (!root || !isLockScreenLaunch) return;
    if (pathname.includes('/call/')) {
      wasOnCall.current = true;
      return;
    }
    if (!wasOnCall.current) return;
    const timer = setTimeout(() => {
      // The next launch of the app is an ordinary one.
      wasOnCall.current = false;
      setLockScreenLaunch(false);
      BackHandler.exitApp();
    }, 500);
    return () => clearTimeout(timer);
  }, [root, isLockScreenLaunch, pathname]);

  return { isLockScreenLaunch };
};
