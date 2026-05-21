import ThemedText from '@/components/atoms/a-themed-text';
import Logo from '@/components/icons/i-logo';
import { Image } from 'expo-image';
import DetailsLayout from '@/components/layouts/details';
import ChatInput, { ChatInputData } from '@/components/organisms/o-chat-input';
import ChatMessageBubble from '@/components/molecules/m-chat-message-bubble';
import HostingChatSummaryCard from '@/components/molecules/m-hosting-chat-summary-card';
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
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { useAudioPlayer } from 'expo-audio';
import { useNotifications } from '@/components/contexts/notifications';

export default function ChatDetails() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const flatListRef = React.useRef<FlatList>(null);
  const { setActiveChatId } = useNotifications();
  const sendSoundPlayer = useAudioPlayer(require('@/assets/audio/message-send-sound.mp3'));
  const [onlineRecipient, setOnlineRecipeint] =
    React.useState<OnlineUserSubscription['onlineUser']>();

  // Register this chat as active so the notification provider doesn't show
  // a banner when a message arrives while the user is already viewing it
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

  const [{ fetching: chatFetching, data: chatData }] = useHostingChatQuery({
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

    // Play send sound
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
    // In an inverted list index+1 is the older (visually above) message,
    // index-1 is the newer (visually below) message.
    const above = messages[index + 1];
    const below = messages[index - 1];

    const isFirstInGroup =
      !above ||
      above.isSender !== item.isSender ||
      new Date(item.createdAt).getTime() - new Date(above.createdAt).getTime() >
        GROUP_THRESHOLD_MS;

    const isLastInGroup =
      !below ||
      below.isSender !== item.isSender ||
      new Date(below.createdAt).getTime() - new Date(item.createdAt).getTime() >
        GROUP_THRESHOLD_MS;

    return (
      <ChatMessageBubble
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
        image:
          chatData?.hostingChat.recipientUser?.profile?.image?.publicUrl ??
          getDefaultProfileImageUrl(chatData?.hostingChat.recipientUser?.profile.fullName ?? ''),
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
          <View style={{ marginBottom: 32, marginTop: 16 }}>
            <View style={{ alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: hexToRgba(colors.primary, 0.35),
                }}
              >
                <Image
                  source={{
                    uri:
                      chatData?.hostingChat.recipientUser?.profile?.image?.publicUrl ??
                      getDefaultProfileImageUrl(
                        chatData?.hostingChat.recipientUser?.profile.fullName ?? '',
                      ),
                  }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 17 }}>
                {chatData?.hostingChat.recipientUser?.profile.fullName}
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: onlineRecipient?.online
                      ? colors.success
                      : hexToRgba(colors.text, 0.25),
                  }}
                />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.5),
                    fontFamily: Fonts.regular,
                  }}
                >
                  {onlineRecipient?.online ? 'Active now' : 'Offline'}
                </ThemedText>
              </View>
              <View
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: hexToRgba(colors.text, 0.12),
                  marginTop: 4,
                }}
              />
            </View>
            <HostingChatSummaryCard hosting={chatData?.hostingChat.hosting} />
            {messagesFetching && hasNextPage && (
              <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
            )}
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
