import notifee from '@notifee/react-native';
import { gql, type Client } from 'urql';
import { EventEmitter } from '@/lib/utils/event-emitter';

/**
 * The number on the app icon.
 *
 * Pushes carry the server's unread count when they arrive, but nothing on the
 * device lowers it when you read things — so the app re-asks the server and
 * sets the icon itself: on launch, on returning to the foreground, when a push
 * lands, and after anything is marked read (see graphql-client.tsx).
 */
export const UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

/** Mutations that lower the unread count; the GraphQL client re-syncs after them. */
export const READ_MUTATIONS = [
  'clearChatUrnreadMessages',
  'markNotificationAsRead',
  'markAllNotificationsAsRead',
];

const SYNC_EVENT = 'app-badge:sync';

/** Ask for a badge re-sync from anywhere (no client needed). */
export const requestBadgeSync = () => EventEmitter.emit(SYNC_EVENT);
export const onBadgeSyncRequest = (fn: () => void) => {
  EventEmitter.on(SYNC_EVENT, fn);
  return () => EventEmitter.off(SYNC_EVENT, fn);
};

export async function syncAppBadge(client: Client) {
  const res = await client
    .query<{ unreadNotificationCount: number }>(UNREAD_NOTIFICATION_COUNT, {}, { requestPolicy: 'network-only' })
    .toPromise();
  // An older API without the field errors here: leave the badge alone.
  const count = res.data?.unreadNotificationCount;
  if (typeof count === 'number') await notifee.setBadgeCount(count);
}

export const clearAppBadge = () => notifee.setBadgeCount(0);

const MESSAGE_INTENTS = ['notification', 'NewMessage'];

/**
 * Remove a chat's message notifications from the notification centre once the
 * chat is open. System-shown pushes carry the chat as `id`; banners we show in
 * the foreground carry it as `chatId`. Call notifications also carry `chatId`,
 * so only message intents match — opening a chat never dismisses a ringing call.
 */
export async function dismissChatNotifications(chatId: string) {
  const shown = await notifee.getDisplayedNotifications();
  await Promise.all(
    shown
      .filter((n) => {
        const data = n.notification?.data;
        if (!MESSAGE_INTENTS.includes(String(data?.intent))) return false;
        return data?.id === chatId || data?.chatId === chatId;
      })
      .map((n) => (n.id ? notifee.cancelDisplayedNotification(n.id) : null)),
  );
}
