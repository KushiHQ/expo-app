import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { handleIncomingCall, handleNotifeeEvent } from '@/lib/utils/call';
import * as Linking from 'expo-linking';

export function initializeNotifications() {
  // Note: setBackgroundMessageHandler is already registered in index.js.
  // Registering it again here via the modular API would be a duplicate — omitted.

  notifee.onBackgroundEvent(async (event) => {
    // Handle chat message notification taps from the background
    if (event.type === EventType.PRESS || event.type === EventType.ACTION_PRESS) {
      const data = event.detail.notification?.data as any;
      if (data?.intent === 'notification' && data?.chatId) {
        await Linking.openURL(`kushi://chats/${data.chatId}`);
        return;
      }
    }
    await handleNotifeeEvent(event);
  });

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
      largeIcon: notification?.image, // Use the image from FCM notification if available
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
