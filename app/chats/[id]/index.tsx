import ThemedText from '@/components/atoms/a-themed-text';
import Logo from '@/components/icons/i-logo';
import DetailsLayout from '@/components/layouts/details';
import ChatInput, { ChatInputData } from '@/components/organisms/o-chat-input';
import ChatMessageBubble from '@/components/molecules/m-chat-message-bubble';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  ChatMessagesQuery,
  CreateUpdateMessageMutation,
  CreateUpdateMessageMutationVariables,
  LatestHostingChatMessageSubscription,
  OnlineUserSubscription,
  useChatMessagesQuery,
  useClearChatUrnreadMessagesMutation,
  useHostingChatQuery,
  useLatestHostingChatMessageSubscription,
  useOnlineUserSubscription,
} from '@/lib/services/graphql/generated';
import { CREATE_UPDATE_MESSAGE } from '@/lib/services/graphql/requests/mutations/hosting-chat';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import * as Sentry from '@sentry/react-native';
import { handleError } from '@/lib/utils/error';
import { generateRNFile } from '@/lib/utils/file';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import React from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { useAudioPlayer } from 'expo-audio';
import { useNotifications } from '@/components/contexts/notifications';
import { Avatar, KText, Photo } from '@/components/k';
import { color as k } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';

export default function ChatDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemeColors();
  const flatListRef = React.useRef<FlatList>(null);
  const isNearBottomRef = React.useRef(true);
  const { setActiveChatId } = useNotifications();
  const sendSoundPlayer = useAudioPlayer(require('@/assets/audio/message-send-sound.mp3'));
  const [onlineRecipient, setOnlineRecipeint] =
    React.useState<OnlineUserSubscription['onlineUser']>();

  React.useEffect(() => {
    setActiveChatId(String(id));
    return () => setActiveChatId(null);
  }, [id, setActiveChatId]);

  const {
    items: pagedMessages,
    fetching: messagesFetching,
    error,
    loadMore,
    hasNextPage,
  } = useInfiniteQuery(useChatMessagesQuery, {
    queryKey: 'chatMessages',
    initialVariables: { chatId: cast(id) },
    limit: 20,
    requestPolicy: 'network-only',
  });

  const [{ data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });

  const [messages, setMessages] = React.useState<
    (ChatMessagesQuery['chatMessages'][0] & { sending?: boolean })[]
  >([]);

  const [, clearUnread] = useClearChatUrnreadMessagesMutation();

  const handleNewMessage = (
    msg: LatestHostingChatMessageSubscription['latestHostingChatMessage'],
  ) => {
    setMessages((prev) => {
      const items = [...prev];
      const itemIndex = items.findIndex(
        (v) => v.id === msg.id || (v.sending && v.text === msg.text),
      );
      if (itemIndex >= 0) {
        items[itemIndex] = msg;
      } else {
        items.unshift(msg);
        if (isNearBottomRef.current) {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }
      return items;
    });
  };

  const [{ error: subError }] = useLatestHostingChatMessageSubscription(
    {
      variables: { chatId: cast(id) },
    },
    (prev: LatestHostingChatMessageSubscription['latestHostingChatMessage'][] = [], curr) => {
      handleNewMessage(curr.latestHostingChatMessage);
      return [curr.latestHostingChatMessage, ...(prev ?? [])];
    },
  );

  React.useEffect(() => {
    if (subError) {
      Sentry.captureException(subError, {
        tags: { area: 'chat-subscription', chatId: String(id) },
        extra: {
          graphQLErrors: subError.graphQLErrors,
          networkError: subError.networkError?.message,
        },
      });
      console.error(
        '[Chat subscription error]',
        subError.message,
        subError.graphQLErrors,
        subError.networkError,
      );
      handleError(subError);
    }
  }, [subError]);

  React.useEffect(() => {
    clearUnread({ chatId: cast(id) });
  }, [clearUnread, id]);

  React.useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  React.useEffect(() => {
    if (pagedMessages) {
      setMessages((prev) => {
        const existingIds = new Set(pagedMessages.map((m) => m.id));
        const subscriptionMessages = prev.filter((m) => !existingIds.has(m.id));

        return [...subscriptionMessages, ...pagedMessages].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });
    }
  }, [pagedMessages]);

  useOnlineUserSubscription(
    {
      variables: {
        userId: chatData?.hostingChat.recipientUser?.id ?? '',
      },
      pause: !chatData?.hostingChat.recipientUser?.id,
    },
    (prev: OnlineUserSubscription['onlineUser'][] = [], curr) => {
      setOnlineRecipeint(curr.onlineUser);
      return [curr.onlineUser, ...prev];
    },
  );

  const handleSend = (input: ChatInputData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      text: input.text,
      isSender: true,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sending: true,
      assets: [],
    } as any;

    setMessages((prev) => [optimisticMessage, ...prev]);

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    try {
      sendSoundPlayer.play();
    } catch (error) {
      console.error('Failed to play send sound', error);
    }

    formMutation<CreateUpdateMessageMutation, CreateUpdateMessageMutationVariables>(
      CREATE_UPDATE_MESSAGE,
      {
        input: {
          text: input.text,
          assets: [
            ...input.documents.map((doc) => generateRNFile(doc.uri)),
            ...input.images.map((uri) => generateRNFile(uri)),
            ...(input.audio ? [generateRNFile(input.audio)] : []),
          ],
          chatId: cast(id),
        },
      },
    ).then((res) => {
      if (res.error) {
        handleError(res.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      if (res.data?.createUpdateMessage.id) {
        handleNewMessage(res.data.createUpdateMessage);
      }
    });
  };

  const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

  const renderItem = ({
    item,
    index,
  }: {
    item: ChatMessagesQuery['chatMessages'][0] & { sending?: boolean };
    index: number;
  }) => {
    const above = messages[index + 1];
    const below = messages[index - 1];

    const isFirstInGroup =
      !above ||
      above.isSender !== item.isSender ||
      new Date(item.createdAt).getTime() - new Date(above.createdAt).getTime() > GROUP_THRESHOLD_MS;

    const isLastInGroup =
      !below ||
      below.isSender !== item.isSender ||
      new Date(below.createdAt).getTime() - new Date(item.createdAt).getTime() > GROUP_THRESHOLD_MS;

    return (
      <ChatMessageBubble
        senderName={item.sender?.profile?.fullName}
        message={item}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  return (
    <DetailsLayout
      scrollable={false}
      avatar={{
        image: chatData?.hostingChat.recipientUser?.profile?.image?.publicUrl,
        online: onlineRecipient?.online,
        lastSeen: onlineRecipient?.lastSeen,
      }}
      title={chatData?.hostingChat.recipientUser?.profile.fullName}
      withPhone
      withVideo
      footer={<ChatInput onSend={handleSend} />}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          // In an inverted list offset 0 = bottom (newest). Track proximity to bottom.
          isNearBottomRef.current = e.nativeEvent.contentOffset.y < 120;
        }}
        scrollEventThrottle={100}
        onEndReached={() => {
          if (hasNextPage) loadMore();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexGrow: 1,
          justifyContent: 'flex-end',
        }}
        ListFooterComponent={
          <View style={{ marginBottom: 24, marginTop: 16, gap: 18 }}>
            <Pressable
              style={{ alignItems: 'center', gap: 8 }}
              onPress={() => {
                const uid = chatData?.hostingChat.recipientUser?.id;
                if (uid) router.push(`/users/${uid}`);
              }}
            >
              <Avatar
                size={72}
                name={chatData?.hostingChat.recipientUser?.profile.fullName}
                uri={chatData?.hostingChat.recipientUser?.profile?.image?.publicUrl}
              />
              <KText v="heading">{chatData?.hostingChat.recipientUser?.profile.fullName}</KText>
              <KText v="xs">Messages stay on Kushi so we can help if anything goes wrong.</KText>
            </Pressable>
            {chatData?.hostingChat.hosting ? (
              <Pressable
                onPress={() => router.push(`/hostings/${chatData.hostingChat.hosting?.id}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  gap: 12,
                  padding: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: k.line2,
                  backgroundColor: k.bg2,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Photo
                  assetId={chatData.hostingChat.hosting.coverImage?.asset?.id}
                  w={200}
                  h={200}
                  style={{ width: 60, height: 60 }}
                />
                <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
                  <KText v="micro" style={{ color: k.amber }}>
                    About this home
                  </KText>
                  <KText v="bodyStrong" numberOfLines={1}>
                    {chatData.hostingChat.hosting.title}
                  </KText>
                  <KText v="xs" numberOfLines={1}>
                    {place(chatData.hostingChat.hosting.city, chatData.hostingChat.hosting.state)}
                    {chatData.hostingChat.hosting.price
                      ? ` · ${naira(chatData.hostingChat.hosting.price)} ${perInterval(chatData.hostingChat.hosting.paymentInterval)}`
                      : ''}
                  </KText>
                </View>
              </Pressable>
            ) : null}
            {messagesFetching && hasNextPage && <ActivityIndicator color={k.amber} />}
          </View>
        }
        ListEmptyComponent={
          !messagesFetching && !messages.length ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 40,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    flex: 1,
                    height: 0.5,
                    backgroundColor: hexToRgba(colors.text, 0.1),
                  }}
                />
                <Logo width={28} height={32} style={{ opacity: 0.2 }} />
                <View
                  style={{
                    flex: 1,
                    height: 0.5,
                    backgroundColor: hexToRgba(colors.text, 0.1),
                  }}
                />
              </View>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: hexToRgba(colors.text, 0.3),
                  fontFamily: Fonts.regular,
                  letterSpacing: 0.3,
                }}
              >
                Start the conversation
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </DetailsLayout>
  );
}
