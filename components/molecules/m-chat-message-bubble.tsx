import React from 'react';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { formatChatMessageTime } from '@/lib/utils/time';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { ChatMessagesQuery } from '@/lib/services/graphql/generated';
import ListDocument from './m-list-document';
import ListImage from '../atoms/a-list-image';
import AudioPlayerBubble from '../atoms/a-audio-player';
import { AUDIO_EXTENSIONS } from '@/lib/utils/file';
import { Clock } from 'lucide-react-native';

type Props = {
  message: ChatMessagesQuery['chatMessages'][number] & { sending?: boolean };
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
};

// In an inverted FlatList, borderTopRight = visual bottom-right (tail position for sender).
// isLastInGroup = this is the bottom-most bubble in the group = gets the tail.
// isFirstInGroup = top-most bubble in the group = connecting corner on top.
const getBubbleRadius = (isSender: boolean, isFirst: boolean, isLast: boolean) => {
  const r = 20;
  const tail = 5;
  if (isSender) {
    return {
      borderRadius: r,
      borderTopRightRadius: isLast ? tail : r,
      borderBottomRightRadius: isFirst ? r : tail,
    };
  }
  return {
    borderRadius: r,
    borderTopLeftRadius: isLast ? tail : r,
    borderBottomLeftRadius: isFirst ? r : tail,
  };
};

const ChatMessageBubble: React.FC<Props> = ({
  message,
  isFirstInGroup = true,
  isLastInGroup = true,
}) => {
  const colors = useThemeColors();

  const audioAsset = message.assets.find((a) => {
    const url = a.asset.publicUrl.toLowerCase();
    return (
      a.asset.contentType?.includes('audio') ||
      AUDIO_EXTENSIONS.some((ext) => url.endsWith(`.${ext}`))
    );
  });

  const hasText = Boolean(message.text?.trim());
  const isAudioOnly = audioAsset && !hasText;
  const isSender = message.isSender;
  const radius = getBubbleRadius(isSender, isFirstInGroup, isLastInGroup);
  const nonAudioAssets = message.assets.filter((a) => a.id !== audioAsset?.id);

  return (
    <View
      style={{
        alignSelf: isSender ? 'flex-end' : 'flex-start',
        maxWidth: '78%',
        marginBottom: isLastInGroup ? 8 : 2,
        opacity: message.sending ? 0.7 : 1,
      }}
    >
      {nonAudioAssets.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 6,
            justifyContent: isSender ? 'flex-end' : 'flex-start',
          }}
        >
          {nonAudioAssets
            .filter((a) => a.asset.contentType?.includes('image'))
            .map((asset, index) => (
              <ListImage
                openable
                images={message.assets
                  .filter((a) => a.asset.contentType?.includes('image'))
                  .map((a) => a.asset.publicUrl)}
                src={asset.asset.publicUrl}
                index={index}
                key={index}
              />
            ))}
          {nonAudioAssets
            .filter((a) => !a.asset.contentType?.includes('image'))
            .map((asset, index) => (
              <ListDocument
                downloadable
                openable
                document={{ type: 'remote', asset }}
                index={index}
                key={index}
              />
            ))}
        </View>
      )}

      <View
        style={[
          radius,
          {
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: isSender ? colors.primary : colors['surface-01'],
            ...(isSender
              ? {}
              : { borderWidth: 0.5, borderColor: hexToRgba(colors.text, 0.12) }),
          },
        ]}
      >
        {isAudioOnly ? (
          <AudioPlayerBubble url={audioAsset.asset.publicUrl} isSender={isSender} />
        ) : (
          <ThemedText
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: isSender ? colors['primary-content'] : colors.text,
              fontFamily: Fonts.regular,
            }}
          >
            {message.text}
          </ThemedText>
        )}
      </View>

      {isLastInGroup && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
            paddingHorizontal: 4,
            justifyContent: isSender ? 'flex-end' : 'flex-start',
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: hexToRgba(colors.text, 0.38),
              fontFamily: Fonts.regular,
            }}
          >
            {formatChatMessageTime(message.lastUpdated)}
          </ThemedText>
          {message.sending && <Clock size={10} color={hexToRgba(colors.text, 0.3)} />}
        </View>
      )}
    </View>
  );
};

export default ChatMessageBubble;
