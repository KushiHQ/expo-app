import ThemedText from '@/components/atoms/a-themed-text';
import { LineiconsSearch1 } from '@/components/icons/i-search';
import DetailsLayout from '@/components/layouts/details';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { SURFACE } from '@/lib/constants/surface';
import { Fonts } from '@/lib/constants/theme';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUserChatsQuery } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { AUDIO_EXTENSIONS } from '@/lib/utils/file';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { Image } from 'expo-image';
import { useRouter } from '@/lib/hooks/use-router';
import { useFocusEffect } from '@react-navigation/native';
import { Mic } from 'lucide-react-native';
import moment from 'moment';
import React from 'react';
import { FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Skeleton from '../atoms/a-skeleton';
import EmptyList from '../molecules/m-empty-list';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  variant?: 'guest' | 'host';
};

const ChatSkeleton = () => {
  return (
    <View className="flex-row gap-4 px-2">
      <Skeleton style={{ height: 54, width: 54, borderRadius: 9999 }} />
      <View className="flex-1 gap-3 py-2">
        <Skeleton style={{ height: 18, width: 70 }} />
        <Skeleton style={{ height: 14, width: '100%' }} />
      </View>
      <View className="items-end gap-4 py-2">
        <Skeleton style={{ height: 14, width: 14, borderRadius: 9999 }} />
        <Skeleton style={{ height: 14, width: 50 }} />
      </View>
    </View>
  );
};

const ChatListItem = React.memo(({ chat }: { chat: any }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const pressScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const unread = chat.unreadMessageCount > 0;

  return (
    <AnimatedPressable
      onPressIn={() => (pressScale.value = withSpring(0.97))}
      onPressOut={() => (pressScale.value = withSpring(1))}
      onPress={() => router.push(`/chats/${chat.id}/`)}
      style={[
        {
          // Unread rows get a real warm FILL tint (renders regardless of
          // shadow support); read rows stay neutral. Glow is a bonus on top.
          backgroundColor: unread
            ? hexToRgba(colors.primary, 0.08)
            : hexToRgba(colors.text, 0.05),
          borderRadius: 22,
          marginBottom: 12,
          padding: 16,
          flexDirection: 'row',
          gap: 14,
          alignItems: 'center',
          boxShadow: unread ? SURFACE.glow : SURFACE.shadow,
        },
        animatedStyle,
      ]}
    >
      {/* Avatar — unread threads get a soft amber ring (a filled halo, so it
          shows even without box-shadow) + a glow as a bonus. */}
      <View
        style={{
          padding: unread ? 2.5 : 0,
          borderRadius: 32,
          backgroundColor: unread ? hexToRgba(colors.primary, 0.4) : 'transparent',
          boxShadow: unread ? SURFACE.glow : undefined,
        }}
      >
        <Image
          source={{
            uri:
              chat.recipientUser.profile?.image?.publicUrl ??
              getDefaultProfileImageUrl(chat.recipientUser.profile.fullName ?? ''),
          }}
          style={{ height: 48, width: 48, borderRadius: 24 }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
        />
        {chat.recipientUser.onlineUser.online && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 13,
              height: 13,
              borderRadius: 7,
              backgroundColor: colors.success,
              borderWidth: 2.5,
              borderColor: colors.background,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <ThemedText
            numberOfLines={1}
            style={{
              fontFamily: unread ? Fonts.bold : Fonts.semibold,
              fontSize: 15.5,
              flex: 1,
              color: unread ? colors.text : hexToRgba(colors.text, 0.92),
            }}
          >
            {chat.recipientUser.profile.fullName}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 11,
              fontFamily: unread ? Fonts.semibold : Fonts.regular,
              color: unread ? colors.primary : hexToRgba(colors.text, 0.38),
            }}
          >
            {moment(chat.lastUpdated).fromNow()}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {(() => {
            const lastMessage = chat.lastMessage;
            if (!lastMessage) return <View style={{ flex: 1 }} />;
            const audioAsset = lastMessage.assets.find((a: any) => {
              const url = a.asset.publicUrl.toLowerCase();
              return (
                a.asset.contentType?.includes('audio') ||
                AUDIO_EXTENSIONS.some((ext) => url.endsWith(`.${ext}`))
              );
            });
            const isAudioOnly =
              audioAsset && (!lastMessage.text || lastMessage.text.trim().length === 0);
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {isAudioOnly && (
                  <Mic size={13} color={unread ? colors.primary : hexToRgba(colors.text, 0.45)} />
                )}
                <ThemedText
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: hexToRgba(colors.text, unread ? 0.78 : 0.45),
                    fontFamily: unread ? Fonts.medium : Fonts.regular,
                    flex: 1,
                  }}
                >
                  {isAudioOnly ? 'Voice message' : lastMessage.text}
                </ThemedText>
              </View>
            );
          })()}
          {unread && (
            <View
              style={{
                backgroundColor: colors.primary,
                minWidth: 22,
                height: 22,
                borderRadius: 11,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 7,
                boxShadow: SURFACE.glow,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontFamily: Fonts.bold,
                  color: colors['primary-content'],
                  lineHeight: 15,
                }}
              >
                {chat.unreadMessageCount > 99 ? '99+' : chat.unreadMessageCount}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
});

ChatListItem.displayName = 'ChatListItem';

const ChatScreen: React.FC<Props> = ({ variant = 'guest' }) => {
  const colors = useThemeColors();
  const [searchText, setSearchText] = React.useState('');
  const debouncedSearchText = useDebounce(searchText, 500);

  const initialVariables = React.useMemo(() => ({}), []);

  const {
    items: userChats,
    fetching: chatsFetching,
    loadMore,
    hasNextPage,
    refresh,
    setVariables,
    showInitialSkeleton,
    showEmpty,
  } = useInfiniteQuery(useUserChatsQuery, {
    queryKey: 'userChats',
    initialVariables,
  });

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, []),
  );

  React.useEffect(() => {
    if (debouncedSearchText) {
      setVariables({ filter: { text: debouncedSearchText } });
    } else {
      setVariables({});
    }
  }, [debouncedSearchText]);

  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!chatsFetching) setRefreshing(false);
  }, [chatsFetching]);

  // Skeletons only on the very first load — never while typing a search.
  const showSkeleton = showInitialSkeleton && !refreshing;

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
  };

  const keyExtractor = React.useCallback((item: any) => item.id, []);
  const renderItem = React.useCallback(
    ({ item }: { item: any }) => <ChatListItem chat={item} />,
    [],
  );

  return (
    <DetailsLayout title="Messages" withProfile variant={variant} scrollable={false}>
      <FlatList
        data={userChats}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={renderItem}
        ListHeaderComponent={
          <View className="mb-4">
            <View
              className="flex-row items-center gap-2.5 rounded-full px-4 py-3.5"
              style={{
                backgroundColor: hexToRgba(colors.text, 0.06),
              }}
            >
              <LineiconsSearch1 color={hexToRgba(colors['text'], 0.4)} size={20} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                className="flex-1"
                style={{
                  color: colors['text'],
                  fontSize: 16,
                  fontFamily: Fonts.regular,
                  height: 24,
                  padding: 0,
                }}
                placeholderTextColor={hexToRgba(colors['text'], 0.4)}
                placeholder="Search messages..."
              />
            </View>
            {showSkeleton && (
              <View className="mt-4 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ChatSkeleton key={index} />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={showEmpty ? <EmptyList message="No chats yet" /> : null}
        onEndReached={() => hasNextPage && loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={refreshing} />}
      />
    </DetailsLayout>
  );
};

export default ChatScreen;
