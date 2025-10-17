import ThemedText from "@/components/atoms/a-themed-text";
import { IconParkOutlineDot } from "@/components/icons/i-circle";
import DetailsLayout from "@/components/layouts/details";
import ChatInput from "@/components/molecules/m-chat-input";
import ChatMessageBubble from "@/components/molecules/m-chat-message-bubble";
import HostingChatSummaryCard from "@/components/molecules/m-hosting-chat-summary-card";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { chatsAtom } from "@/lib/stores/chats";
import { hostingsAtom } from "@/lib/stores/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { View } from "react-native";

export default function ChatDetails() {
  const { id } = useLocalSearchParams();
  const chats = useAtomValue(chatsAtom);
  const hostings = useAtomValue(hostingsAtom);
  const colors = useThemeColors();
  const chat = chats.find((c) => c.id === id);
  const hosting = hostings.at(0);

  if (!chat || !hosting) {
    return null;
  }

  return (
    <DetailsLayout
      avatar={chat.user.avatar}
      title={chat.user.name}
      withPhone
      withVideo
      footer={<ChatInput onSend={() => { }} />}
    >
      <View className="mt-4">
        <View className="items-center justify-center">
          <ThemedText style={{ fontFamily: Fonts.medium }}>
            {chat.user.name}
          </ThemedText>
          <View className="flex-row items-center">
            <ThemedText
              style={{ color: hexToRgba(colors.text, 0.5), fontSize: 10 }}
            >
              Active Now
            </ThemedText>
            <IconParkOutlineDot color={colors.success} size={12} />
          </View>
        </View>
        <View className="mt-8">
          <HostingChatSummaryCard hosting={hosting} />
          <View className="gap-4 mt-8">
            {chat.messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
          </View>
        </View>
      </View>
    </DetailsLayout>
  );
}
