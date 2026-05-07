import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import { IconParkOutlineDot } from "@/components/icons/i-circle";
import Logo from "@/components/icons/i-logo";
import DetailsLayout from "@/components/layouts/details";
import ChatInput, { ChatInputData } from "@/components/organisms/o-chat-input";
import ChatMessageBubble from "@/components/molecules/m-chat-message-bubble";
import HostingChatSummaryCard from "@/components/molecules/m-hosting-chat-summary-card";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
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
} from "@/lib/services/graphql/generated";
import { CREATE_UPDATE_MESSAGE } from "@/lib/services/graphql/requests/mutations/hosting-chat";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { generateRNFile } from "@/lib/utils/file";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, View, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import { useAudioPlayer } from "expo-audio";
import { useNotifications } from "@/components/contexts/notifications";

export default function ChatDetails() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const flatListRef = React.useRef<FlatList>(null);
  const { setActiveChatId } = useNotifications();
  const sendSoundPlayer = useAudioPlayer(
    require("@/assets/audio/message-send-sound.mp3"),
  );
  const [onlineRecipient, setOnlineRecipeint] =
    React.useState<OnlineUserSubscription["onlineUser"]>();

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
    queryKey: "chatMessages",
    initialVariables: { chatId: cast(id) },
    limit: 20,
  });

  const [{ fetching: chatFetching, data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });

  const [messages, setMessages] = React.useState<
    (ChatMessagesQuery["chatMessages"][0] & { sending?: boolean })[]
  >([]);

  const [, clearUnread] = useClearChatUrnreadMessagesMutation();

  const handleNewMessage = (
    msg: LatestHostingChatMessageSubscription["latestHostingChatMessage"],
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

  useLatestHostingChatMessageSubscription(
    {
      variables: { chatId: cast(id) },
    },
    (
      prev: LatestHostingChatMessageSubscription["latestHostingChatMessage"][] = [],
      curr,
    ) => {
      handleNewMessage(curr.latestHostingChatMessage);
      return [curr.latestHostingChatMessage, ...(prev ?? [])];
    },
  );

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
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      });
    }
  }, [pagedMessages]);

  useOnlineUserSubscription(
    {
      variables: {
        userId: chatData?.hostingChat.recipientUser?.id ?? "",
      },
      pause: !chatData?.hostingChat.recipientUser?.id,
    },
    (prev: OnlineUserSubscription["onlineUser"][] = [], curr) => {
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
      console.log("Failed to play send sound", error);
    }

    formMutation<
      CreateUpdateMessageMutation,
      CreateUpdateMessageMutationVariables
    >(CREATE_UPDATE_MESSAGE, {
      input: {
        text: input.text,
        assets: [
          ...input.documents.map((doc) => generateRNFile(doc.uri)),
          ...input.images.map((uri) => generateRNFile(uri)),
          ...(input.audio ? [generateRNFile(input.audio)] : []),
        ],
        chatId: cast(id),
      },
    }).then((res) => {
      if (res.error) {
        handleError(res.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      if (res.data?.createUpdateMessage.id) {
        handleNewMessage(res.data.createUpdateMessage);
      }
    });
  };

  const renderItem = ({
    item,
  }: {
    item: ChatMessagesQuery["chatMessages"][0];
  }) => <ChatMessageBubble message={item} />;

  return (
    <>
      <DetailsLayout
        scrollable={false}
        avatar={{
          image: getDefaultProfileImageUrl(
            chatData?.hostingChat.recipientUser?.profile.fullName ?? "",
          ),
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
            justifyContent: "flex-end",
          }}
          ListFooterComponent={
            <View className="mt-4 mb-8">
              <View className="items-center justify-center">
                <ThemedText style={{ fontFamily: Fonts.medium }}>
                  {chatData?.hostingChat.recipientUser?.profile.fullName}
                </ThemedText>
                {onlineRecipient?.online && (
                  <View className="flex-row items-center">
                    <ThemedText
                      style={{
                        color: hexToRgba(colors.text, 0.5),
                        fontSize: 10,
                      }}
                    >
                      Active Now
                    </ThemedText>
                    <IconParkOutlineDot color={colors.success} size={12} />
                  </View>
                )}
              </View>
              <View className="mt-8">
                <HostingChatSummaryCard
                  hosting={chatData?.hostingChat.hosting}
                />
              </View>
              {messagesFetching && hasNextPage && (
                <ActivityIndicator
                  style={{ marginTop: 20 }}
                  color={colors.primary}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            !messagesFetching && !messages.length ? (
              <View className="items-center gap-4 mt-8 flex-1 justify-center">
                <View
                  className="items-center aspect-square p-8 px-16 rounded-full opacity-35 justify-center"
                  style={{ backgroundColor: hexToRgba(colors.text, 0.2) }}
                >
                  <Logo width={120} height={140} />
                </View>
                <ThemedText type="semibold" className="opacity-40">
                  Chat is empty
                </ThemedText>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </DetailsLayout>
      <LoadingModal
        visible={chatFetching || (messagesFetching && !messages.length)}
      />
    </>
  );
}
