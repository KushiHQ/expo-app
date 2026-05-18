import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

const LockScreenManager =
  Platform.OS === 'android' ? requireNativeModule('LockScreenManager') : null;

export function setShowWhenLocked(show: boolean): void {
  LockScreenManager?.setShowWhenLocked(show);
}
