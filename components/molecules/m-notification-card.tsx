import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { Pressable, View, Platform } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { SURFACE } from '@/lib/constants/surface';
import Button from '../atoms/a-button';
import {
  NotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '@/lib/services/graphql/generated';
import { useRouter } from '@/lib/hooks/use-router';
import moment from 'moment';
import notifee from '@notifee/react-native';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  ClipboardList,
  Home,
  LucideIcon,
  MessageCircle,
} from 'lucide-react-native';

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

  // Normalise the subject to bare letters so it matches regardless of how the
  // enum is serialised — the GraphQL value is e.g. "BOOKING_APPLICATION", so a
  // naive lowercase leaves an underscore that never matched "bookingapplication".
  const subjectKey = String(data.subject ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  const intentKey = String(data.intent ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  const getRoute = (): string | null => {
    const id = data.id;
    if (!id) return null;

    if (subjectKey === 'booking') return `/bookings/${id}`;
    if (subjectKey === 'bookingapplication') return `/users/booking-applications/${id}`;
    if (subjectKey === 'hosting') return `/hostings/${id}`;
    if (subjectKey === 'chat') return `/chats/${id}/`;

    // Intent fallback
    if (intentKey === 'notification') return `/chats/${id}/`;

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
    if (subjectKey === 'booking') return 'View Booking';
    if (subjectKey === 'bookingapplication') return 'View Application';
    if (subjectKey === 'hosting') return 'View Listing';
    if (subjectKey === 'chat') return 'Open Chat';
    if (intentKey === 'notification') return 'Open Chat';
    return 'View';
  };

  // A subject-specific icon reads better than the generic logo.
  const SubjectIcon: LucideIcon =
    subjectKey === 'bookingapplication'
      ? ClipboardList
      : subjectKey === 'booking'
        ? CalendarCheck
        : subjectKey === 'hosting'
          ? Home
          : subjectKey === 'chat' || intentKey === 'notification'
            ? MessageCircle
            : Bell;

  return (
    <Pressable
      onPress={handleCardPress}
      className="rounded-[20px]"
      style={{
        backgroundColor: isUnread ? hexToRgba(colors.primary, 0.08) : hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
      }}
    >
      <View className="flex-row items-start gap-3.5 p-4">
        {/* Subject icon chip — unread gets a soft warm glow instead of a hard dot. */}
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: isUnread
              ? hexToRgba(colors.primary, 0.15)
              : hexToRgba(colors.text, 0.08),
            boxShadow: isUnread ? SURFACE.glow : undefined,
          }}
        >
          <SubjectIcon size={18} color={isUnread ? colors.primary : hexToRgba(colors.text, 0.7)} />
        </View>

        {/* Body */}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <ThemedText
              numberOfLines={1}
              style={{
                fontFamily: isUnread ? Fonts.bold : Fonts.semibold,
                fontSize: 14,
                flex: 1,
                color: isUnread ? colors.text : hexToRgba(colors.text, 0.85),
              }}
            >
              {notification.title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 10.5,
                fontFamily: isUnread ? Fonts.semibold : Fonts.regular,
                color: isUnread ? colors.primary : hexToRgba(colors.text, 0.4),
                flexShrink: 0,
              }}
            >
              {moment(notification.createdAt).fromNow()}
            </ThemedText>
          </View>

          <ThemedText
            numberOfLines={2}
            style={{ color: hexToRgba(colors.text, 0.6), fontSize: 12, lineHeight: 17 }}
          >
            {notification.message}
          </ThemedText>

          {/* Action — a soft amber pill, only when the notification links somewhere */}
          {hasRoute && (
            <Button
              variant="soft"
              type="primary"
              onPress={handleButtonPress}
              className="mt-2 flex-row items-center gap-1.5 self-start px-3.5 py-2"
            >
              <ThemedText
                style={{ fontSize: 12, color: colors.primary, fontFamily: Fonts.semibold }}
              >
                {getActionLabel()}
              </ThemedText>
              <ArrowRight size={13} color={colors.primary} />
            </Button>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationCard;
