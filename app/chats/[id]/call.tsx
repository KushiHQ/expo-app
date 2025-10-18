import ThemedText from "@/components/atoms/a-themed-text";
import {
  HeroiconsPhoneXMark,
  HugeiconsVideo01,
} from "@/components/icons/i-phone";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import DetailsLayout from "@/components/layouts/details";
import WaveRectangle from "@/components/vectors/v-wave-rectangle";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { chatsAtom } from "@/lib/stores/chats";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import {
  ImageBackground,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ChatCall() {
  const router = useRouter();
  const colors = useThemeColors();
  const chats = useAtomValue(chatsAtom);
  const { id } = useLocalSearchParams();
  const { failedImages, handleImageError } = useFallbackImages();
  const chat = chats.find((c) => c.id === id);

  if (!chat) {
    return null;
  }

  return (
    <ImageBackground
      source={require("@/assets/images/house-bg.png")}
      style={styles.fullScreen}
      resizeMode="cover"
    >
      <View
        className="flex-1"
        style={{ backgroundColor: hexToRgba("#003c9b", 0.9) }}
      >
        <View
          className="flex-1 relative z-0"
          style={{ backgroundColor: hexToRgba("#ffffff", 0.15) }}
        >
          <View className="absolute bottom-0 opacity-[0.55] right-0 justify-end items-center left-0">
            <WaveRectangle
              width={SCREEN_WIDTH + 100}
              height={500}
              color="#003793"
            />
          </View>
          <DetailsLayout
            background="transparent"
            title="Calling..."
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
                    source={{
                      uri: failedImages.has(0)
                        ? FALLBACK_IMAGE
                        : chat.user.avatar,
                    }}
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
                    onError={() => handleImageError(0)}
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
                    {chat.user.name}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: hexToRgba("#ffffff", 0.6),
                    }}
                  >
                    {chat.user.name}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-6 p-6">
                <Pressable
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.shade }}
                >
                  <QlementineIconsSpeaker16
                    size={28}
                    color={colors["shade-content"]}
                  />
                </Pressable>
                <Pressable
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <HeroiconsPhoneXMark
                    size={37}
                    color={colors["shade-content"]}
                  />
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/chats/${id}/video-call`)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.shade }}
                >
                  <HugeiconsVideo01 size={28} color={colors["shade-content"]} />
                </Pressable>
              </View>
            </View>
          </DetailsLayout>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
