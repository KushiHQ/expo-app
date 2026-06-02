import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useMySupportChatsQuery, useCreateSupportChatMutation } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from '@/lib/hooks/use-router';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Skeleton from '@/components/atoms/a-skeleton';
import EmptyList from '@/components/molecules/m-empty-list';
import { TablerMessage2Filled } from '@/components/icons/i-message';
import Button from '@/components/atoms/a-button';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

const ChatListItem = ({ chat, router, colors }: { chat: any; router: any; colors: any }) => {
  const pressScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const lastMessage = chat.messages?.[0];
  const isUnread = lastMessage && !lastMessage.isReadByUser;

  return (
    <AnimatedPressable
      onPressIn={() => (pressScale.value = withSpring(0.97))}
      onPressOut={() => (pressScale.value = withSpring(1))}
      onPress={() => router.push(`/support/${chat.id}/`)}
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
          borderColor: isUnread
              ? hexToRgba(colors.primary, 0.3)
              : hexToRgba(colors.text, 0.07),
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
      {isUnread && (
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
      <View style={{ position: 'relative', width: 52, height: 52, borderRadius: 26, backgroundColor: hexToRgba(colors.primary, 0.1), alignItems: 'center', justifyContent: 'center' }}>
        <TablerMessage2Filled size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <ThemedText
            numberOfLines={1}
            style={{
              fontFamily: isUnread ? Fonts.semibold : Fonts.medium,
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
              color: hexToRgba(colors.text, isUnread ? 0.55 : 0.38),
            }}
          >
            {moment(chat.lastUpdated).fromNow()}
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {(() => {
            if (!lastMessage) return <View style={{ flex: 1 }} />;
            return (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ThemedText
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: hexToRgba(colors.text, isUnread ? 0.65 : 0.45),
                    fontFamily: isUnread ? Fonts.medium : Fonts.regular,
                    flex: 1,
                  }}
                >
                  {lastMessage.sender ? 'Support: ' : 'You: '}{lastMessage.text}
                </ThemedText>
              </View>
            );
          })()}
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default function SupportChatsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [creating, setCreating] = useState(false);

  const [result, executeQuery] = useMySupportChatsQuery();
  const [, createSupportChat] = useCreateSupportChatMutation();
  
  const chats = result.data?.mySupportChats || [];
  const chatsFetching = result.fetching;

  useFocusEffect(
    React.useCallback(() => {
      executeQuery({ requestPolicy: 'network-only' });
    }, [executeQuery]),
  );

  const handleNewConversation = async () => {
    setCreating(true);
    const res = await createSupportChat({});
    setCreating(false);
    if (res.data?.createSupportChat) {
      router.push(`/support/${res.data.createSupportChat.id}/`);
    }
  };

  return (
    <DetailsLayout title="Support" scrollable={false}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 }}
        renderItem={({ item: chat }) => (
          <ChatListItem chat={chat} router={router} colors={colors} />
        )}
        ListHeaderComponent={
          <View className="mb-4">
            <Button
              onPress={handleNewConversation}
              className="mb-4"
              disabled={creating}
            >
              {creating ? <ActivityIndicator color={colors['primary-content']} /> : <ThemedText content="primary">New Conversation</ThemedText>}
            </Button>
            {chatsFetching && !chats.length && (
              <View className="mt-4 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ChatSkeleton key={index} />
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !chatsFetching && !chats.length ? <EmptyList message="No support conversations yet" /> : null
        }
        refreshControl={<RefreshControl onRefresh={() => executeQuery({ requestPolicy: 'network-only' })} refreshing={chatsFetching} />}
      />
    </DetailsLayout>
  );
}
