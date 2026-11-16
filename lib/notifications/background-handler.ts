import notifee, { EventType } from '@notifee/react-native';
import * as Linking from 'expo-linking';
import { isAppUpdateIntent, openAppStore } from '@/lib/utils/urls';
import { handleCallNotificationPress, isRingIntent, stopRingtone } from '@/lib/utils/call';

// ────────────────────────────────────────────────────────────────────────
// Notifee background event handler
//
// Must be registered at the top-level of the JS bundle (index.js) —
// NOT inside a React component or layout effect.  Notifee fires this
// handler when the user taps a Notifee notification while the app is
// in the background or killed.
// ────────────────────────────────────────────────────────────────────────

notifee.onBackgroundEvent(async (event) => {
  const { type, detail } = event;

  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const data = detail.notification?.data as Record<string, string> | undefined;

    // App-update notification tap → open the device app store.
    if (isAppUpdateIntent(data?.intent)) {
      await openAppStore();
      return;
    }

    // Chat message notification → open the chat
    if (data?.intent === 'notification' && data?.chatId) {
      await Linking.openURL(`kushi://chats/${data.chatId}`);
      return;
    }

    // Verification notification → open verification overview
    if (data?.intent === 'verification' && data?.hostingId) {
      await Linking.openURL(`kushi://hostings/form/verification/overview?id=${data.hostingId}`);
      return;
    }

    // Incoming call (Android): Answer, Decline, a body tap or the full-screen
    // intent while the app is in the background or killed. Answer parks a
    // "join this call" request that the app acts on as soon as it can
    // navigate; Decline tells the caller straight away, with no screen.
    // (This used to do nothing, so Answer opened the app on whatever screen it
    // was last on while the ringtone kept going.)
    await handleCallNotificationPress(detail.pressAction?.id, data);
  } else if (type === EventType.DISMISSED) {
    const data = detail.notification?.data as Record<string, string> | undefined;
    if (isRingIntent(data?.intent)) await stopRingtone();
  }
});
