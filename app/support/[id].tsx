import React from "react";
import { View, FlatList, ActivityIndicator, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import DetailsLayout from "@/components/layouts/details";
import ChatMessageBubble from "@/components/molecules/m-chat-message-bubble";
import ChatInput from "@/components/organisms/o-chat-input";
import SupportChatContextCard from "@/components/molecules/m-support-chat-context-card";
import SupportRatingPrompt from "@/components/molecules/m-support-rating-prompt";
import ThemedText from "@/components/atoms/a-themed-text";
import Logo from "@/components/icons/i-logo";
import {
  SupportChatMessagesQuery,
  SupportChatStatus,
  useSupportChatQuery,
  useSupportChatMessagesQuery,
  useSendSupportMessageMutation,
  useSupportChatMessageAddedSubscription,
  SupportChatMessageAddedSubscription,
} from "@/lib/services/graphql/generated";
import { useUser } from "@/lib/hooks/user";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { cast } from "@/lib/types/utils";

const LIMIT = 20;

type MessageItem = SupportChatMessagesQuery["supportChat"]["messages"][0] & {
  sending?: boolean;
};

export default function SupportChatScreen() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const { user } = useUser();
  const chatId = String(id);
  const flatListRef = React.useRef<FlatList>(null);
  const isNearBottomRef = React.useRef(true);

  // ─── Pagination state ─────────────────────────────────────────────────────
  const [offset, setOffset] = React.useState(0);
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [hasNextPage, setHasNextPage] = React.useState(true);

  // ─── Chat metadata ────────────────────────────────────────────────────────
  const [{ data: chatData }] = useSupportChatQuery({
    variables: { id: chatId },
    requestPolicy: "cache-and-network",
  });

  // ─── Paginated messages ────────────────────────────────────────────────────
  const [{ data: messagesData, fetching: messagesFetching }] =
    useSupportChatMessagesQuery({
      variables: { id: chatId, pagination: { limit: LIMIT, offset } },
      requestPolicy: "network-only",
    });

  React.useEffect(() => {
    const incoming = messagesData?.supportChat?.messages ?? [];
    if (incoming.length === 0 && offset > 0) {
      setHasNextPage(false);
      return;
    }
    if (incoming.length < LIMIT) {
      setHasNextPage(false);
    }
    setMessages((prev) => {
      if (offset === 0) {
        const optimistic = prev.filter((m) => m.sending);
        const merged = [...optimistic, ...incoming].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return merged;
      }
      const existingIds = new Set(prev.map((m) => m.id));
      const unique = incoming.filter((m) => !existingIds.has(m.id));
      return [...prev, ...unique].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, [messagesData, offset]);

  // ─── Mutation ─────────────────────────────────────────────────────────────
  const [, sendMessage] = useSendSupportMessageMutation();

  // ─── Subscription ─────────────────────────────────────────────────────────
  useSupportChatMessageAddedSubscription(
    { variables: { chatId } },
    (
      prev: SupportChatMessageAddedSubscription["supportChatMessageAdded"][] = [],
      curr,
    ) => {
      const msg = curr.supportChatMessageAdded;
      setMessages((prevMsgs) => {
        const items = [...prevMsgs];
        const idx = items.findIndex(
          (v) => v.id === msg.id || (v.sending && v.text === msg.text),
        );
        if (idx >= 0) {
          items[idx] = cast({ ...msg });
        } else {
          items.unshift(cast({ ...msg }));
          if (isNearBottomRef.current) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }
        return items;
      });
      return [msg, ...(prev ?? [])];
    },
  );

  // ─── Support rating prompt ─────────────────────────────────────────────────
  const [showRatingPrompt, setShowRatingPrompt] = React.useState(false);
  const [hasRated, setHasRated] = React.useState(false);

  const chat = chatData?.supportChat;

  React.useEffect(() => {
    if (
      chat?.status === SupportChatStatus.Resolved ||
      chat?.status === SupportChatStatus.Closed
    ) {
      if (chat.supportChatRating) {
        setHasRated(true);
      } else {
        setShowRatingPrompt(true);
      }
    }
  }, [chat?.status, chat?.supportChatRating]);

  // ─── Send ──────────────────────────────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      createdAt: new Date().toISOString(),
      isReadByUser: true,
      sending: true,
      sender: {
        id: user.user?.id ?? "",
        isStaff: false,
        profile: { fullName: user.user?.profile?.fullName ?? "Me" },
      } as any,
    } as any as MessageItem;

    setMessages((prev) => [optimistic, ...prev]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    const result = await sendMessage({ chatId, text });
    if (result.error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else if (result.data?.sendSupportMessage) {
      const msg = result.data.sendSupportMessage;
      setMessages((prev) => {
        const items = [...prev];
        const idx = items.findIndex((v) => v.id === tempId);
        if (idx >= 0) {
          items[idx] = { ...msg } as any as MessageItem;
        }
        return items;
      });
    }
  };

  // ─── Group threshold ───────────────────────────────────────────────────────
  const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

  const renderItem = ({
    item,
    index,
  }: {
    item: MessageItem;
    index: number;
  }) => {
    const isMe = item.sender?.id === user.user?.id;
    const above = messages[index + 1];
    const below = messages[index - 1];

    const isFirstInGroup =
      !above ||
      above.sender?.id !== item.sender?.id ||
      new Date(item.createdAt).getTime() - new Date(above.createdAt).getTime() >
      GROUP_THRESHOLD_MS;

    const isLastInGroup =
      !below ||
      below.sender?.id !== item.sender?.id ||
      new Date(below.createdAt).getTime() - new Date(item.createdAt).getTime() >
      GROUP_THRESHOLD_MS;

    const isStaff = item.sender?.isStaff === true;

    return (
      <ChatMessageBubble
        message={
          {
            id: item.id,
            text: item.text ?? "",
            createdAt: item.createdAt,
            lastUpdated: item.createdAt,
            isSender: isMe,
            isDeleted: false,
            assets: item.assets ?? [],
            sender: {
              id: item.sender?.id ?? "",
              isStaff: isStaff,
              profile: {
                id: "",
                fullName: isMe
                  ? "Me"
                  : (item.sender?.profile.fullName ?? "Kushi Support"),
              },
            },
          } as any
        }
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
        isStaffMessage={isStaff}
        senderName={
          isMe
            ? "You"
            : (item.sender?.profile?.fullName ??
              (isStaff ? "Kushi Support" : undefined))
        }
      />
    );
  };

  const userProfile = chat?.user?.profile;
  const userImageUrl =
    userProfile?.image?.publicUrl ??
    getDefaultProfileImageUrl(userProfile?.fullName ?? "");

  return (
    <DetailsLayout
      title="Kushi Support"
      scrollable={false}
      footer={<ChatInput onSend={(data) => handleSendMessage(data.text)} />}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          isNearBottomRef.current = e.nativeEvent.contentOffset.y < 120;
        }}
        scrollEventThrottle={100}
        onEndReached={() => {
          if (hasNextPage && !messagesFetching) {
            setOffset((prev) => prev + LIMIT);
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
        ListFooterComponent={
          <View style={{ marginBottom: 32, marginTop: 16 }}>
            <View style={{ alignItems: "center", gap: 8, marginBottom: 24 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: hexToRgba(colors.primary, 0.35),
                }}
              >
                <Image
                  source={{ uri: userImageUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 17 }}>
                {userProfile?.fullName ?? "You"}
              </ThemedText>
              <View
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: hexToRgba(colors.text, 0.12),
                  marginTop: 4,
                }}
              />
            </View>

            {chat && (chat.hosting || chat.booking || chat.transaction) && (
              <SupportChatContextCard
                itemType={chat.itemType}
                hosting={chat.hosting}
                booking={chat.booking}
                transaction={chat.transaction}
              />
            )}

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
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 40,
                gap: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
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
      />

      {/* Support Rating Modal */}
      <Modal
        visible={showRatingPrompt && !hasRated}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingPrompt(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: hexToRgba(colors.background, 0.8),
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <SupportRatingPrompt
            chatId={chatId}
            onDismiss={() => setShowRatingPrompt(false)}
            onSubmit={() => {
              setHasRated(true);
              setShowRatingPrompt(false);
            }}
          />
        </View>
      </Modal>
    </DetailsLayout>
  );
}
