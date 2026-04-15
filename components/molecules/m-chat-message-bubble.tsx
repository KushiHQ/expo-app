import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { formatChatMessageTime } from "@/lib/utils/time";
import { twMerge } from "tailwind-merge";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { ChatMessagesQuery } from "@/lib/services/graphql/generated";
import ListDocument from "./m-list-document";
import ListImage from "../atoms/a-list-image";
import AudioPlayerBubble from "../atoms/a-audio-player";
import { AUDIO_EXTENSIONS } from "@/lib/utils/file";

type Props = {
  message: ChatMessagesQuery["chatMessages"][number];
};

const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const colors = useThemeColors();
  const audioAsset = message.assets.find((a) => {
    const url = a.asset.publicUrl.toLowerCase();
    const hasAudioMime = a.asset.contentType?.includes("audio");
    const hasAudioExt = AUDIO_EXTENSIONS.some((ext) => url.endsWith(`.${ext}`));

    return hasAudioMime || hasAudioExt;
  });
  const hasText = message.text && message.text.trim().length > 0;
  const isAudioOnly = audioAsset && !hasText;

  return (
    <View
      className={twMerge("max-w-[250px] mb-4", message.isSender && "items-end")}
      style={{
        alignSelf: message.isSender ? "flex-end" : "flex-start",
      }}
    >
      {message.assets.filter((a) => a.id !== audioAsset?.id).length > 0 && (
        <View
          className={twMerge(
            "mb-2 flex-row gap-4 flex-wrap",
            message.isSender ? "justify-end" : "justify-start",
          )}
        >
          {message.assets
            .filter((a) => a.id !== audioAsset?.id)
            .filter((a) => a.asset.contentType?.includes("image"))
            .map((asset, index) => (
              <ListImage
                openable
                images={message.assets
                  .filter((a) => a.asset.contentType?.includes("image"))
                  .map((a) => a.asset.publicUrl)}
                src={asset.asset.publicUrl}
                index={index}
                key={index}
              />
            ))}
          {message.assets
            .filter((a) => !a.asset.contentType?.includes("image"))
            .map((asset, index) => (
              <ListDocument
                downloadable
                openable
                document={{ type: "remote", asset }}
                index={index}
                key={index}
              />
            ))}
        </View>
      )}
      <View
        className={twMerge(
          "p-3 rounded-2xl",
          message.isSender ? "rounded-tr-none" : "rounded-tl-none",
        )}
        style={{
          backgroundColor: message.isSender
            ? colors.primary
            : hexToRgba(colors.text, 0.1),
        }}
      >
        {isAudioOnly ? (
          <AudioPlayerBubble
            url={audioAsset.asset.publicUrl}
            isSender={message.isSender}
          />
        ) : (
          <ThemedText
            style={{
              color: message.isSender ? colors["primary-content"] : colors.text,
            }}
          >
            {message.text}
          </ThemedText>
        )}
      </View>
      <ThemedText
        style={{ fontSize: 12, color: hexToRgba(colors.text, 0.7) }}
        className="px-1"
      >
        {formatChatMessageTime(message.lastUpdated)}
      </ThemedText>
    </View>
  );
};

export default ChatMessageBubble;
