import { Message } from "@/lib/constants/mocks/chat";
import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { formatToShortTime } from "@/lib/utils/time";
import { twMerge } from "tailwind-merge";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";

type Props = {
  message: Message;
};

const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const colors = useThemeColors();

  return (
    <View
      className={twMerge("max-w-[250px]", message.isSender && "items-end")}
      style={{
        alignSelf: message.isSender ? "flex-end" : "flex-start",
      }}
    >
      <View
        className="p-3 rounded-xl"
        style={{
          backgroundColor: message.isSender
            ? colors.primary
            : hexToRgba(colors.text, 0.1),
        }}
      >
        <ThemedText>{message.text}</ThemedText>
      </View>
      <ThemedText
        style={{ fontSize: 12, color: hexToRgba(colors.text, 0.7) }}
        className="px-1"
      >
        {formatToShortTime(message.date)}
      </ThemedText>
    </View>
  );
};

export default ChatMessageBubble;
