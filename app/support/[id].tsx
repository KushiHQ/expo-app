import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DetailsLayout from '@/components/layouts/details';
import ChatMessageBubble from '@/components/molecules/m-chat-message-bubble';
import ChatInput from '@/components/organisms/o-chat-input';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { 
  useSupportChatQuery,
  useSendSupportMessageMutation,
  useSupportChatMessageAddedSubscription
} from '@/lib/services/graphql/generated';
import { useUser } from '@/lib/hooks/user';
import * as Haptics from 'expo-haptics';

export default function SupportChatScreen() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const { user } = useUser();
  const chatId = String(id);

  const [{ data, fetching }] = useSupportChatQuery({
    variables: { id: chatId, pagination: { limit: 100, offset: 0 } },
    requestPolicy: 'cache-and-network',
  });

  const [, sendMessage] = useSendSupportMessageMutation();

  useSupportChatMessageAddedSubscription({ variables: { chatId } });

  const chat = data?.supportChat;
  const messages = chat?.messages || [];
  
  const handleSendMessage = async (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage({ chatId, text });
  };

  return (
    <DetailsLayout title="Kushi Support" scrollable={false} footer={
      <ChatInput 
        onSend={(data) => handleSendMessage(data.text)} 
      />
    }>
      {fetching && !messages.length ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[...messages].reverse()}
          inverted
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 10 }}
          renderItem={({ item }) => {
            const isMe = item.sender?.id === user.user?.id;
            return (
              <ChatMessageBubble
                message={{
                  id: item.id,
                  text: item.text ?? "",
                  createdAt: item.createdAt,
                  lastUpdated: item.createdAt,
                  isSender: isMe,
                  isDeleted: false,
                  assets: [],
                  sender: {
                    id: item.sender?.id ?? "",
                    profile: {
                      id: "",
                      fullName: isMe ? "Me" : (item.sender?.profile.fullName ?? "Kushi Support"),
                    }
                  } as any
                } as any}
                isFirstInGroup={true}
                isLastInGroup={true}
              />
            );
          }}
        />
      )}
    </DetailsLayout>
  );
}
