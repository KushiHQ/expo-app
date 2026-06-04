import React from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useMySupportChatsQuery } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from '@/lib/hooks/use-router';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Skeleton from '@/components/atoms/a-skeleton';
import EmptyList from '@/components/molecules/m-empty-list';
import { Support } from '@/components/icons/i-support';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SupportChatSkeleton = () => {
  return (
    <View className="flex-row gap-4 px-2">
      <Skeleton style={{ height: 54, width: 54, borderRadius: 16 }} />
      <View className="flex-1 gap-3 py-2">
        <Skeleton style={{ height: 18, width: 120 }} />
        <Skeleton style={{ height: 14, width: '100%' }} />
      </View>
      <View className="items-end gap-4 py-2">
        <Skeleton style={{ height: 14, width: 50 }} />
      </View>
    </View>
  );
};

const SupportChatListItem = ({ chat, router, colors }: { chat: any; router: any; colors: any }) => {
  const pressScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const lastMessage = chat.messages?.[0];
  const hasUnread = lastMessage && !lastMessage.isReadByUser;

  return (
    <AnimatedPressable
      onPressIn={() => (pressScale.value = withSpring(0.97))}
      onPressOut={() => (pressScale.value = withSpring(1))}
      onPress={() => router.push(`/support/${chat.id}`)}
      style={[
        {
          backgroundColor: colors['surface-01'],
          borderRadius: 16,
          marginBottom: 10,
          padding: 14,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          borderWidth: 0.5,
          borderColor: hasUnread ? hexToRgba(colors.primary, 0.3) : hexToRgba(colors.text, 0.07),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      {hasUnread && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 10,
            bottom: 10,
            width: 3,
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3,
            backgroundColor: colors.primary,
          }}
        />
      )}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: hexToRgba(colors.primary, 0.1),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Support size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <ThemedText
            numberOfLines={1}
            style={{
              fontFamily: hasUnread ? Fonts.semibold : Fonts.medium,
              fontSize: 15,
              flex: 1,
              marginRight: 8,
            }}
          >
            Kushi Support
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 11,
              fontFamily: Fonts.regular,
              color: hexToRgba(colors.text, hasUnread ? 0.55 : 0.38),
            }}
          >
            {moment(chat.lastUpdated).fromNow()}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ThemedText
            numberOfLines={1}
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, hasUnread ? 0.65 : 0.45),
              fontFamily: hasUnread ? Fonts.medium : Fonts.regular,
              flex: 1,
            }}
          >
            {lastMessage
              ? lastMessage.text
              : chat.status === 'OPEN'
                ? 'New conversation'
                : 'Closed conversation'}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default function SupportInboxScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [{ data, fetching }, refetch] = useMySupportChatsQuery({
    variables: { pagination: { limit: 50, offset: 0 } },
    requestPolicy: 'cache-and-network',
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch({ requestPolicy: 'network-only' });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const chats = data?.mySupportChats || [];

  return (
    <DetailsLayout title="Support" scrollable={false}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 }}
        renderItem={({ item: chat }) => (
          <SupportChatListItem chat={chat} router={router} colors={colors} />
        )}
        ListHeaderComponent={
          <View className="mb-4">
            {fetching && !chats.length && (
              <View className="mt-4 gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SupportChatSkeleton key={index} />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !fetching && !chats.length ? <EmptyList message="No support chats" /> : null
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => refetch({ requestPolicy: 'network-only' })}
            refreshing={fetching}
          />
        }
      />
    </DetailsLayout>
  );
}
