import { useActiveCall } from "@/lib/hooks/call";
import CallBackground from "../atoms/a-call-background";
import DetailsLayout from "../layouts/details";
import { Pressable, View } from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import { getImagePlaceholderUrl } from "@/lib/utils/urls";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { hexToRgba } from "@/lib/utils/colors";
import {
  F7PhoneDownFill,
  Fa7SolidPhone,
  HugeiconsVideo01,
} from "../icons/i-phone";
import { QlementineIconsSpeaker16 } from "../icons/i-speaker";
import React from "react";
import { useHostingChatQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useLocalSearchParams } from "expo-router";

type Props = {
  callData?: ReturnType<typeof useActiveCall>;
};

const CallScreen: React.FC<Props> = ({ callData }) => {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const [{ data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });

  const recipient = chatData?.hostingChat.recipientUser;

  return (
    <CallBackground>
      <DetailsLayout
        background="transparent"
        title={
          callData?.isRinging || !callData
            ? !callData || callData?.isCaller
              ? "Calling..."
              : "Incoming Call"
            : recipient?.profile.fullName
        }
        backButton="solid"
      >
        <View className="flex-1 justify-between">
          <View className="flex-1 items-center gap-4 pb-28 justify-center">
            <View
              className="h-[160px] w-[160px] border-[6px]"
              style={{
                borderRadius: 999,
                borderColor: colors.primary,
              }}
            >
              <Image
                source={getImagePlaceholderUrl(recipient?.profile.gender)}
                style={{
                  height: "100%",
                  width: "100%",
                  borderRadius: 999,
                }}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: PROPERTY_BLURHASH }}
                placeholderContentFit="cover"
                cachePolicy="memory-disk"
                priority="high"
              />
            </View>
            <View className="items-center gap-1">
              <ThemedText
                style={{
                  fontSize: 18,
                  color: "white",
                  fontFamily: Fonts.medium,
                }}
              >
                {callData?.isRinging || !callData
                  ? !callData || callData.isCaller
                    ? "Calling..."
                    : "Incoming Call"
                  : callData?.callDuration}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: hexToRgba("#ffffff", 0.6),
                }}
              >
                {recipient?.profile.fullName}
              </ThemedText>
            </View>
          </View>
          <View className="flex-row items-center justify-center gap-10 p-6">
            {!callData?.isCaller && callData?.isRinging ? (
              <>
                <View className="items-center gap-2 mr-8">
                  <Pressable
                    onPress={callData?.leaveCall}
                    className="w-20 h-20 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.error }}
                  >
                    <F7PhoneDownFill
                      size={37}
                      color={colors["shade-content"]}
                    />
                  </Pressable>
                  <ThemedText>Decline</ThemedText>
                </View>
                <View className="items-center gap-2 ml-8">
                  <Pressable
                    className="w-20 h-20 rounded-full items-center justify-center"
                    onPress={callData?.joinCall}
                    style={{ backgroundColor: colors.success }}
                  >
                    <Fa7SolidPhone size={37} color={colors["shade-content"]} />
                  </Pressable>
                  <ThemedText>Answer</ThemedText>
                </View>
              </>
            ) : (
              <>
                <Pressable
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.shade }}
                >
                  <QlementineIconsSpeaker16
                    size={28}
                    color={colors["shade-content"]}
                  />
                </Pressable>
                <Pressable
                  onPress={callData?.leaveCall}
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <F7PhoneDownFill size={37} color={colors["shade-content"]} />
                </Pressable>
                <Pressable
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.shade }}
                >
                  <HugeiconsVideo01 size={28} color={colors["shade-content"]} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </DetailsLayout>
    </CallBackground>
  );
};

export default CallScreen;
