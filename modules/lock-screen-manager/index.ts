import { requireNativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

const LockScreenManager =
  Platform.OS === 'android' ? requireNativeModule('LockScreenManager') : null;

export function setShowWhenLocked(show: boolean): void {
  LockScreenManager?.setShowWhenLocked(show);
}

// ── Incoming-call notification (Android) ─────────────────────────────────────
// Native draws the notification with full Answer / Decline buttons and keeps
// what the user tapped until JavaScript asks for it. See
// android/…/IncomingCallNotification.kt and CallActions.kt.

export type CallActionName = 'answer' | 'decline' | 'open' | 'full_screen' | 'dismiss';

export type CallAction = {
  id: number;
  action: CallActionName;
  /** The call push this notification was shown for. */
  data: Record<string, string>;
};

type IncomingCallModule = {
  show(call: {
    chatId: string;
    caller?: string;
    kind: 'voice' | 'video';
    timeoutMs: number;
    data: Record<string, string>;
  }): void;
  cancel(chatId: string): void;
  active(): Record<string, string>[];
  takeActions(): CallAction[];
  done(id: number): void;
  canUseFullScreenIntent(): boolean;
  addListener(event: 'onAction', listener: () => void): { remove(): void };
};

/** Null on iOS, and in an Android build made before this module existed. */
export const CallNotification: IncomingCallModule | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<IncomingCallModule>('KushiIncomingCall') : null;
