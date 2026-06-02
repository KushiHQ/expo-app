import ThemedText from '@/components/atoms/a-themed-text';
import Logo from '@/components/icons/i-logo';
import DetailsLayout from '@/components/layouts/details';
import ChatInput, { ChatInputData } from '@/components/organisms/o-chat-input';
import ChatMessageBubble from '@/components/molecules/m-chat-message-bubble';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  useSupportChatQuery,
  useSupportChatMessageAddedSubscription,
  useSendSupportMessageMutation,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useUser } from '@/lib/hooks/user';

export default function SupportChatDetails() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const flatListRef = React.useRef<FlatList>(null);
  const isNearBottomRef = React.useRef(true);
  const sendSoundPlayer = useAudioPlayer(require('@/assets/audio/message-send-sound.mp3'));
  const user = useUser();
  const currentUserId = user.user.user?.id;

  const [{ data: chatData }] = useSupportChatQuery({
    variables: { id: cast(id) },
    requestPolicy: 'cache-and-network',
  });

  const [messages, setMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (chatData?.supportChat?.messages) {
      setMessages([...chatData.supportChat.messages].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    }
  }, [chatData?.supportChat?.messages]);

  const handleNewMessage = (msg: any) => {
    setMessages((prev) => {
      const items = [...prev];
      const itemIndex = items.findIndex((v) => v.id === msg.id || (v.sending && v.text === msg.text));
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

  useSupportChatMessageAddedSubscription(
    {
      variables: { chatId: cast(id) },
    },
    (prev, curr) => {
      if (curr.supportChatMessageAdded) {
        handleNewMessage(curr.supportChatMessageAdded);
      }
      return curr;
    },
  );

  const [, sendSupportMessage] = useSendSupportMessageMutation();

  const handleSend = async (input: ChatInputData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      text: input.text,
      createdAt: new Date().toISOString(),
      sending: true,
      sender: { id: currentUserId, profile: { fullName: 'Me' } }
    };

    setMessages((prev) => [optimisticMessage, ...prev]);

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    try {
      sendSoundPlayer.play();
    } catch (error) {
      console.error('Failed to play send sound', error);
    }

    const res = await sendSupportMessage({ chatId: cast(id), text: input.text });
    if (res.data?.sendSupportMessage) {
      handleNewMessage(res.data.sendSupportMessage);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const GROUP_THRESHOLD_MS = 5 * 60 * 1000;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isSender = item.sender?.id === currentUserId;
    const itemWithIsSender = { ...item, isSender, assets: [] }; // ChatMessageBubble expects isSender

    const above = messages[index + 1];
    const below = messages[index - 1];

    const aboveIsSender = above?.sender?.id === currentUserId;
    const belowIsSender = below?.sender?.id === currentUserId;

    const isFirstInGroup =
      !above ||
      aboveIsSender !== isSender ||
      new Date(item.createdAt).getTime() - new Date(above.createdAt).getTime() > GROUP_THRESHOLD_MS;

    const isLastInGroup =
      !below ||
      belowIsSender !== isSender ||
      new Date(below.createdAt).getTime() - new Date(item.createdAt).getTime() > GROUP_THRESHOLD_MS;

    return (
      <ChatMessageBubble
        message={itemWithIsSender}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  return (
    <DetailsLayout
      scrollable={false}
      title="Kushi Support"
      footer={<ChatInput onSend={handleSend} hideAttachments={true} />}
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
                  backgroundColor: hexToRgba(colors.primary, 0.1),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Logo width={36} height={36} />
              </View>
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 17 }}>
                Kushi Support
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.5),
                    fontFamily: Fonts.regular,
                  }}
                >
                  We typically reply within a few minutes
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
          </View>
        }
        ListEmptyComponent={
          !messages.length ? (
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
                How can we help you today?
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </DetailsLayout>
  );
}
