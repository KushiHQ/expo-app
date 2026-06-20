import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { Pressable, View, Platform } from 'react-native';
import Logo from '../icons/i-logo';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import Button from '../atoms/a-button';
import {
  NotificationsQuery,
  NotificationSubject,
  NotificationIntent,
  NotificationType,
  useMarkNotificationAsReadMutation,
} from '@/lib/services/graphql/generated';
import { useRouter } from '@/lib/hooks/use-router';
import moment from 'moment';
import notifee from '@notifee/react-native';

type Props = {
  notification: NotificationsQuery['notifications'][number];
  onRead?: () => void; // optional callback to trigger a list refresh
};

const NotificationCard: React.FC<Props> = ({ notification, onRead }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [, markAsRead] = useMarkNotificationAsReadMutation();

  // Defensive data parsing — notification.data may be a JSON string or already an object
  const data = React.useMemo(() => {
    const raw = notification.data;
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw;
  }, [notification.data]);

  const getRoute = (): string | null => {
    const subject = data.subject;
    const id = data.id;
    const intent = data.intent;

    if (!id) return null;

    // Subject-based routing — compare case-insensitively for robustness
    const s = String(subject).toLowerCase();
    if (s === 'booking') return `/bookings/${id}`;
    if (s === 'bookingapplication') return `/users/booking-applications/${id}`;
    if (s === 'hosting') return `/hostings/${id}`;
    if (s === 'chat') return `/chats/${id}/`;

    // Intent fallback
    const i = String(intent).toLowerCase();
    if (i === 'notification') return `/chats/${id}/`;

    return null;
  };

  const markReadAndNavigate = async () => {
    if (!notification.isRead) {
      await markAsRead({ notificationId: notification.id });
      if (Platform.OS === 'ios') {
        await notifee.decrementBadgeCount(1);
      }
      onRead?.();
    }

    const route = getRoute();
    if (route) {
      router.push(route as any);
    }
  };

  const handleCardPress = () => markReadAndNavigate();

  const handleButtonPress = (e: any) => {
    e.stopPropagation?.();
    markReadAndNavigate();
  };

  const hasRoute = !!getRoute();
  const isUnread = !notification.isRead;

  const getActionLabel = () => {
    const subject = data.subject;
    const intent = data.intent;
    const s = String(subject).toLowerCase();
    const i = String(intent).toLowerCase();
    if (s === 'booking') return 'View Booking';
    if (s === 'bookingapplication') return 'View Application';
    if (s === 'hosting') return 'View Listing';
    if (s === 'chat') return 'Open Chat';
    if (i === 'notification') return 'Open Chat';
    return 'View';
  };

  return (
    <Pressable
      onPress={handleCardPress}
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: isUnread ? hexToRgba(colors.primary, 0.07) : hexToRgba(colors.text, 0.05),
        borderWidth: 1,
        borderColor: isUnread ? hexToRgba(colors.primary, 0.18) : hexToRgba(colors.text, 0.08),
      }}
    >
      <View className="flex-row items-start gap-3 p-4">
        {/* Icon with unread dot */}
        <View className="relative mt-0.5">
          <View
            className="items-center justify-center rounded-full"
            style={{
              backgroundColor: isUnread
                ? hexToRgba(colors.primary, 0.15)
                : hexToRgba(colors.text, 0.1),
              width: 36,
              height: 36,
            }}
          >
            <Logo width={18} height={15} />
          </View>
          {isUnread && (
            <View
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.background,
              }}
            />
          )}
        </View>

        {/* Body */}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <ThemedText
              numberOfLines={1}
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 13,
                flex: 1,
                color: isUnread ? colors.text : hexToRgba(colors.text, 0.8),
              }}
            >
              {notification.title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 10,
                color: hexToRgba(colors.text, 0.4),
                flexShrink: 0,
              }}
            >
              {moment(notification.createdAt).fromNow()}
            </ThemedText>
          </View>

          <ThemedText
            numberOfLines={2}
            style={{ color: hexToRgba(colors.text, 0.6), fontSize: 12 }}
          >
            {notification.message}
          </ThemedText>

          {/* Action button — only shown when there's a route */}
          {hasRoute && (
            <View className="mt-2 self-start">
              <Button
                variant="outline"
                type="shade"
                className="px-3 py-1.5"
                onPress={handleButtonPress}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: colors.primary,
                    fontFamily: Fonts.medium,
                  }}
                >
                  {getActionLabel()}
                </ThemedText>
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* Unread accent bar on the left */}
      {isUnread && (
        <View
          className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl"
          style={{ backgroundColor: colors.primary }}
        />
      )}
    </Pressable>
  );
};

export default NotificationCard;
