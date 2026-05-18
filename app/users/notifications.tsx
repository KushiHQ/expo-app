import DetailsLayout from '@/components/layouts/details';
import { ScrollView, View } from 'react-native';
import NotificationBell from '@/assets/vectors/notification-bell.svg';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import NotificationCard from '@/components/molecules/m-notification-card';
import Button from '@/components/atoms/a-button';
import Skeleton from '@/components/atoms/a-skeleton';
import { InfiniteScrollTrigger } from '@/components/atoms/a-infinite-scroll-trigger';
import {
  NotificationType,
  useMarkAllNotificationsAsReadMutation,
  useNotificationsQuery,
} from '@/lib/services/graphql/generated';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';

// Filter tabs: null means "All"
const FILTER_TABS: { label: string; value: NotificationType | null }[] = [
  { label: 'All', value: null },
  { label: 'General', value: NotificationType.General },
  { label: 'Guest', value: NotificationType.GuestAlert },
  { label: 'Host', value: NotificationType.HostAlert },
  { label: 'System', value: NotificationType.System },
];

function NotificationSkeleton() {
  const colors = useThemeColors();
  return (
    <View className="gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          className="flex-row items-center gap-4 rounded-xl p-4"
          style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
        >
          {/* Icon circle */}
          <Skeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
          {/* Text lines */}
          <View className="flex-1 gap-2">
            <Skeleton style={{ height: 13, borderRadius: 6, width: '60%' }} />
            <Skeleton style={{ height: 11, borderRadius: 6, width: '85%' }} />
          </View>
          {/* Button placeholder */}
          <Skeleton style={{ height: 32, width: 56, borderRadius: 8 }} />
        </View>
      ))}
    </View>
  );
}

export default function UserNotifications() {
  const colors = useThemeColors();
  const [activeType, setActiveType] = React.useState<NotificationType | null>(null);
  const [, markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const filter = activeType ? { type: activeType } : {};

  const {
    items: notifications,
    fetching,
    loadMore,
    hasNextPage,
    refresh,
    setVariables,
  } = useInfiniteQuery(useNotificationsQuery, {
    queryKey: 'notifications',
    initialVariables: { filter },
    limit: 20,
  });

  // Propagate filter changes into the infinite query
  React.useEffect(() => {
    setVariables({ filter });
  }, [activeType]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasUnread = notifications.some((n) => n && !n.isRead);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({});
    refresh();
  };

  const isFirstLoad = fetching && notifications.length === 0;

  return (
    <DetailsLayout title="Notifications">
      {/* Filter tabs + mark all read */}
      <View className="mb-4 flex-row items-center justify-between">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4, paddingRight: 8 }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeType === tab.value;
            return (
              <Button
                key={tab.label}
                onPress={() => setActiveType(tab.value)}
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: isActive ? colors.primary : hexToRgba(colors.text, 0.08),
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: isActive ? '#fff' : hexToRgba(colors.text, 0.7),
                  }}
                >
                  {tab.label}
                </ThemedText>
              </Button>
            );
          })}
        </ScrollView>
        {hasUnread && (
          <Button
            variant="outline"
            type="shade"
            className="ml-2 shrink-0 px-3 py-1"
            onPress={handleMarkAllAsRead}
          >
            <ThemedText style={{ fontSize: 11 }}>Mark all read</ThemedText>
          </Button>
        )}
      </View>

      {/* Skeleton */}
      {isFirstLoad && <NotificationSkeleton />}

      {/* Empty state */}
      {!isFirstLoad && notifications.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <View
            className="items-center justify-center gap-4 rounded-xl border p-10"
            style={{ borderColor: hexToRgba(colors.text, 0.2) }}
          >
            <NotificationBell />
            <ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
              No Notifications Yet
            </ThemedText>
          </View>
        </View>
      )}

      {/* List */}
      {!isFirstLoad && notifications.length > 0 && (
        <View className="gap-3">
          {notifications.map(
            (notification) =>
              notification && (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={refresh}
                />
              ),
          )}

          <InfiniteScrollTrigger
            onInView={loadMore}
            isLoading={fetching && notifications.length > 0}
            active={hasNextPage}
          />
        </View>
      )}
    </DetailsLayout>
  );
}
