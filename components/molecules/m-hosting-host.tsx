import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import ThemedText from '../atoms/a-themed-text';
import { CuidaBuildingOutline } from '../icons/i-home';
import { TablerMessage2 } from '../icons/i-message';
import { SolarPhoneOutline } from '../icons/i-phone';
import { Fonts } from '@/lib/constants/theme';
import { HostingQuery, useInitiateHostingChatMutation } from '@/lib/services/graphql/generated';
import moment from 'moment';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import LoadingModal from '../atoms/a-loading-modal';
import { handleError } from '@/lib/utils/error';
import { useRouter } from 'expo-router';
import { buildCallURL } from '@/lib/utils/call';
import * as Haptics from 'expo-haptics';

type Props = {
  hosting?: HostingQuery['hosting'];
};

const HostingHost: React.FC<Props> = ({ hosting }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [{ fetching: chatInitiating }, initiateChat] = useInitiateHostingChatMutation();

  const handleInitiateChat = () => {
    if (hosting)
      initiateChat({ hostingId: hosting?.id }).then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data) {
          router.push(`/chats/${res.data.initiateHostingChat.id}`);
        }
      });
  };

  const handleInitiateCall = () => {
    if (hosting)
      initiateChat({ hostingId: hosting?.id }).then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data) {
          router.push(buildCallURL(res.data.initiateHostingChat.id, 'voice', true));
        }
      });
  };

  const messageScale = useSharedValue(1);
  const callScale = useSharedValue(1);

  const messageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));

  const callAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: callScale.value }],
  }));

  return (
    <>
      <View
        className="gap-4 border-b pb-8"
        style={{
          borderColor: hexToRgba(colors.text, 0.1),
        }}
      >
        <ThemedText className="mt-4" style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
          Host
        </ThemedText>
        <View
          className="gap-4 overflow-hidden rounded-xl p-6"
          style={{
            backgroundColor: hexToRgba(colors.text, 0.1),
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="h-8 w-8 overflow-hidden rounded-full border"
                style={{
                  borderColor: hexToRgba(colors['text'], 0.6),
                  borderWidth: 2,
                }}
              >
                <Image
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                  }}
                  source={{
                    uri:
                      hosting?.host.user.profile?.image?.publicUrl ??
                      getDefaultProfileImageUrl(hosting?.host.user.profile.fullName ?? ''),
                  }}
                />
              </View>
              <ThemedText>{hosting?.host.user.profile.fullName}</ThemedText>
            </View>
            <View className="flex-row items-center gap-2">
              <CuidaBuildingOutline color={colors.accent} />
              <ThemedText>{moment(hosting?.host.createdAt).fromNow()}</ThemedText>
            </View>
          </View>
          <View className="mt-4 flex-row items-center gap-4">
            <AnimatedPressable
              onPressIn={() => (messageScale.value = withSpring(0.96))}
              onPressOut={() => (messageScale.value = withSpring(1))}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleInitiateChat();
              }}
              accessibilityLabel="Initiate chat with host"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
              style={[
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                },
                messageAnimatedStyle,
              ]}
            >
              <TablerMessage2 size={22} color="#fff" strokeWidth={2} />
              <ThemedText style={{ color: '#fff', fontFamily: Fonts.semibold, fontSize: 16 }}>
                Message
              </ThemedText>
            </AnimatedPressable>
            <AnimatedPressable
              onPressIn={() => (callScale.value = withSpring(0.96))}
              onPressOut={() => (callScale.value = withSpring(1))}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleInitiateCall();
              }}
              accessibilityLabel="Initiate call with host"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-4"
              style={[
                {
                  borderColor: hexToRgba(colors.text, 0.15),
                  backgroundColor: colors['surface-01'],
                },
                callAnimatedStyle,
              ]}
            >
              <SolarPhoneOutline size={22} color={colors.text} strokeWidth={2} />
              <ThemedText
                style={{
                  color: colors.text,
                  fontFamily: Fonts.semibold,
                  fontSize: 16,
                }}
              >
                Call
              </ThemedText>
            </AnimatedPressable>
          </View>
        </View>
      </View>
      <LoadingModal visible={chatInitiating} />
    </>
  );
};

export default HostingHost;
