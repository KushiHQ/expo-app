import notifee, { AndroidImportance } from '@notifee/react-native';

export function initializeNotifications() {
  // ─── REMOVED ────────────────────────────────────────────────────────
  // The notifee.onBackgroundEvent() handler now lives in
  // lib/notifications/background-handler.ts and is imported in index.js
  // at the top-level of the bundle (required by Notifee for background
  // tap handling).
  // ─────────────────────────────────────────────────────────────────────

  notifee.setNotificationCategories([
    {
      id: 'incoming-call',
      actions: [
        { id: 'accept', title: 'Accept', foreground: true },
        { id: 'reject', title: 'Reject', destructive: true },
      ],
    },
  ]);
}

/**
 * Displays a Notifee notification banner for an incoming chat message.
 * Called in the foreground when the user is NOT currently viewing that chat.
 */
export const handleIncomingChatMessage = async (remoteMessage: any) => {
  const data = remoteMessage.data;
  const notification = remoteMessage.notification;

  const channelId = await notifee.createChannel({
    id: 'chat-messages',
    name: 'Chat Messages',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.displayNotification({
    // Use a stable-ish id so rapid messages from the same chat collapse
    id: `chat-${data?.id}`,
    title: notification?.title ?? 'New Message',
    body: notification?.body ?? 'You have a new message',
    data: {
      intent: 'notification',
      chatId: data?.id ?? '',
    },
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default', launchActivity: 'default' },
      color: '#266DD3',
      // Only set largeIcon when the value is an actual https:// URL;
      // undefined / null / empty string / non-URL values cause Notifee to throw.
      largeIcon:
        typeof notification?.image === 'string' && notification.image.startsWith('http')
          ? notification.image
          : undefined,
    },
    ios: {
      sound: 'message-notification.mp3',
      foregroundPresentationOptions: {
        alert: true,
        sound: true,
        badge: true,
      },
    },
  });
};

/**
 * Displays a Notifee notification banner for a hosting verification status
 * change. The tap target is the verification overview for the affected
 * hosting, looked up via `data.hostingId`.
 */
export const handleIncomingVerificationNotification = async (remoteMessage: any) => {
  const data = remoteMessage.data ?? {};
  const notification = remoteMessage.notification;

  const channelId = await notifee.createChannel({
    id: 'verification-status',
    name: 'Verification Updates',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.displayNotification({
    id: `verification-${data?.requestId ?? data?.hostingId ?? Math.random().toString(36).slice(2)}`,
    title: notification?.title ?? 'Verification Update',
    body: notification?.body ?? 'Your verification request was updated.',
    data: {
      intent: 'verification',
      hostingId: data?.hostingId ?? '',
      requestId: data?.requestId ?? '',
    },
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default', launchActivity: 'default' },
      color: '#F59E0B',
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        alert: true,
        sound: true,
        badge: true,
      },
    },
  });
};
