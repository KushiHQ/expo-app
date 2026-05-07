import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import ThemedText from "../atoms/a-themed-text";
import { CuidaBuildingOutline } from "../icons/i-home";
import { TablerMessage2 } from "../icons/i-message";
import { SolarPhoneOutline } from "../icons/i-phone";
import { Fonts } from "@/lib/constants/theme";
import {
  HostingQuery,
  useInitiateHostingChatMutation,
} from "@/lib/services/graphql/generated";
import moment from "moment";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import LoadingModal from "../atoms/a-loading-modal";
import { handleError } from "@/lib/utils/error";
import { useRouter } from "expo-router";
import { buildCallURL } from "@/lib/utils/call";
import * as Haptics from "expo-haptics";

type Props = {
  hosting?: HostingQuery["hosting"];
};

const HostingHost: React.FC<Props> = ({ hosting }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [{ fetching: chatInitiating }, initiateChat] =
    useInitiateHostingChatMutation();

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
          router.push(
            buildCallURL(res.data.initiateHostingChat.id, "voice", true),
          );
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
        className="pb-8 gap-4 border-b"
        style={{
          borderColor: hexToRgba(colors.text, 0.1),
        }}
      >
        <ThemedText
          className="mt-4"
          style={{ fontFamily: Fonts.medium, fontSize: 18 }}
        >
          Host
        </ThemedText>
        <View
          className="p-6 gap-4 overflow-hidden rounded-xl"
          style={{
            backgroundColor: hexToRgba(colors.text, 0.1),
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-full border overflow-hidden"
                style={{
                  borderColor: hexToRgba(colors["text"], 0.6),
                  borderWidth: 2,
                }}
              >
                <Image
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                  }}
                  source={{
                    uri: getDefaultProfileImageUrl(
                      hosting?.host.user.profile.fullName ?? "",
                    ),
                  }}
                />
              </View>
              <ThemedText>{hosting?.host.user.profile.fullName}</ThemedText>
            </View>
            <View className="flex-row items-center gap-2">
              <CuidaBuildingOutline color={colors.accent} />
              <ThemedText>
                {moment(hosting?.host.createdAt).fromNow()}
              </ThemedText>
            </View>
          </View>
          <View className="flex-row mt-4 gap-4 items-center">
            <AnimatedPressable
              onPressIn={() => (messageScale.value = withSpring(0.96))}
              onPressOut={() => (messageScale.value = withSpring(1))}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleInitiateChat();
              }}
              accessibilityLabel="Initiate chat with host"
              className="flex-1 flex-row gap-2 rounded-2xl items-center py-4 justify-center"
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
              <ThemedText
                style={{ color: "#fff", fontFamily: Fonts.semibold, fontSize: 16 }}
              >
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
              className="flex-1 flex-row gap-2 rounded-2xl items-center py-4 justify-center border"
              style={[
                {
                  borderColor: hexToRgba(colors.text, 0.15),
                  backgroundColor: colors["surface-01"],
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
