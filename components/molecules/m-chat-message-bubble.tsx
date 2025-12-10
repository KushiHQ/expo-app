import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { formatToShortTime } from "@/lib/utils/time";
import { twMerge } from "tailwind-merge";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { ChatMessagesQuery } from "@/lib/services/graphql/generated";
import { useUserStore } from "@/lib/stores/users";

type Props = {
  message: ChatMessagesQuery["chatMessages"][number];
};

const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const user = useUserStore((c) => c.user);
  const colors = useThemeColors();
  const isSender = message.sender.id == user.user?.id;

  return (
    <View
      className={twMerge("max-w-[250px]", isSender && "items-end")}
      style={{
        alignSelf: isSender ? "flex-end" : "flex-start",
      }}
    >
      <View
        className="p-3 rounded-xl"
        style={{
          backgroundColor: isSender
            ? colors.primary
            : hexToRgba(colors.text, 0.1),
        }}
      >
        <ThemedText
          style={{
            color: isSender ? colors["primary-content"] : colors.text,
          }}
        >
          {message.text}
        </ThemedText>
      </View>
      <ThemedText
        style={{ fontSize: 12, color: hexToRgba(colors.text, 0.7) }}
        className="px-1"
      >
        {formatToShortTime(message.lastUpdated)}
      </ThemedText>
    </View>
  );
};

export default ChatMessageBubble;
