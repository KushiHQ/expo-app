import notifee, { EventType } from '@notifee/react-native';
import * as Linking from 'expo-linking';
import { isAppUpdateIntent, openAppStore } from '@/lib/utils/urls';

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

    // Incoming call notifications are handled by CallKeep (iOS) /
    // handleIncomingCall (Android) — no deep-link needed here.
  }
});
