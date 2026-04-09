import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
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
            `/chats/${res.data.initiateHostingChat.id}/call/voice?initiate=true`,
          );
        }
      });
  };

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
          <View className="flex-row gap-4 items-center">
            <Pressable
              onPress={handleInitiateChat}
              accessibilityLabel="Initiate chat with host"
              className="flex-1 rounded items-center p-1 justify-center"
              aria-label="Message"
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
            >
              <TablerMessage2 color={colors.accent} />
            </Pressable>
            <Pressable
              onPress={handleInitiateCall}
              accessibilityLabel="Initiate call with host"
              className="flex-1 rounded items-center p-1 justify-center"
              aria-label="Call"
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
            >
              <SolarPhoneOutline color={colors.accent} />
            </Pressable>
          </View>
        </View>
      </View>
      <LoadingModal visible={chatInitiating} />
    </>
  );
};

export default HostingHost;
