// Register Notifee background handler BEFORE anything else.
// This must execute at the top-level of the bundle — Notifee requires
// it to be registered before the app process is suspended.
import './lib/notifications/background-handler';

import 'expo-router/entry';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { handleIncomingCall } from './lib/utils/call';
import {
  handleIncomingAppUpdate,
  handleIncomingChatMessage,
  handleIncomingVerificationNotification,
} from './lib/utils/notifications';
import { isAppUpdateIntent } from './lib/utils/urls';
import { onIosCallPush, setupIosCalls } from './lib/call/ios';

// iOS: PushKit + CallKit (lib/call/ios.ts). Registered at bundle load so
// CallKit events queued during a cold start are picked up.
setupIosCalls();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const data = remoteMessage.data;

  if (Platform.OS === 'ios') {
    // VoIP pushes are handled by PushKit (lib/call/ios.ts). FCM call pushes on
    // iOS are only a fallback for devices without a VoIP token yet, so JS
    // reports them to CallKit itself.
    if (data?.intent === 'voice-call' || data?.intent === 'video-call') {
      onIosCallPush(data, true);
    } else if (data?.intent === 'cancel_call' || data?.intent === 'decline_call') {
      onIosCallPush(data, false);
    }
  } else {
    // Android: route by intent, mirroring the foreground onMessage handler.
    // Call intents → call UI/ringtone; chat, verification & app-update → a banner.
    const intent = data?.intent;
    if (
      intent === 'voice-call' ||
      intent === 'video-call' ||
      intent === 'cancel_call' ||
      intent === 'decline_call'
    ) {
      await handleIncomingCall(remoteMessage);
    } else if (remoteMessage.notification) {
      // The API sends chat, verification and app-update pushes with a
      // `notification` block, which FCM already shows in the tray while the app
      // isn't in the foreground (taps land in onNotificationOpenedApp /
      // getInitialNotification). Only data-only pushes need a Notifee banner
      // here, or every one would show twice.
    } else if (intent === 'notification') {
      await handleIncomingChatMessage(remoteMessage);
    } else if (intent === 'verification') {
      await handleIncomingVerificationNotification(remoteMessage);
    } else if (isAppUpdateIntent(intent)) {
      await handleIncomingAppUpdate(remoteMessage);
    }
  }
});
