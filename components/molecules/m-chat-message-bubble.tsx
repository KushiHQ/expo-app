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
  /** Whether the message sender is a staff/admin member */
  isStaffMessage?: boolean;
  /** Display name for the sender on non-user messages */
  senderName?: string;
};

// In an inverted FlatList each item is flipped via scaleY(-1), so:
//   borderTopRight (code) = visual bottom-right
//   borderBottomRight (code) = visual top-right
// isFirstInGroup = topmost bubble in the group (open end, no connecting corner at top)
// isLastInGroup  = bottommost bubble (tail corner at visual bottom, connecting corner at visual top)
//
// Inner-side corner rule (the side with the tail/connecting corners):
//   solo (first && last): fully round — no connecting corners needed
//   all other positions:  tail/flat — either a connecting corner or the actual tail
const getBubbleRadius = (isSender: boolean, isFirst: boolean, isLast: boolean) => {
  const r = 20;
  const tail = 5;
  const isSolo = isFirst && isLast;

  if (isSender) {
    return {
      borderRadius: r,
      borderTopRightRadius: isSolo ? r : tail, // visual bottom-right: tail or connecting
      borderBottomRightRadius: isFirst ? r : tail, // visual top-right: open or connecting
    };
  }
  return {
    borderRadius: r,
    borderTopLeftRadius: isSolo ? r : tail, // visual bottom-left: tail or connecting
    borderBottomLeftRadius: isFirst ? r : tail, // visual top-left: open or connecting
  };
};

const ChatMessageBubble: React.FC<Props> = ({
  message,
  isFirstInGroup = true,
  isLastInGroup = true,
  isStaffMessage = false,
  senderName,
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

  const displayName = isSender
    ? 'You'
    : (senderName ?? (isStaffMessage ? 'Kushi Support' : 'User'));

  return (
    <View
      style={{
        alignSelf: isSender ? 'flex-end' : 'flex-start',
        maxWidth: '78%',
        marginBottom: isLastInGroup ? 8 : 2,
        opacity: message.sending ? 0.7 : 1,
      }}
    >
      {/* Sender name label on non-user messages */}
      {!isSender && displayName && (
        <ThemedText
          style={{
            fontSize: 11,
            color: isStaffMessage ? colors.primary : hexToRgba(colors.text, 0.45),
            fontFamily: Fonts.semibold,
            marginBottom: 3,
            paddingHorizontal: 4,
            textTransform: 'capitalize',
          }}
        >
          {displayName}
        </ThemedText>
      )}

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
            ...(isSender ? {} : { borderWidth: 0.5, borderColor: hexToRgba(colors.text, 0.12) }),
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
