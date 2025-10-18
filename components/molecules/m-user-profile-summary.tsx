import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { VaadinPaintbrush } from "../icons/i-brush";
import ThemedText from "../atoms/a-themed-text";
import { SolarMedalStarBold } from "../icons/i-medal";
import { Fonts } from "@/lib/constants/theme";
import React from "react";

type Props = {
  edit?: boolean;
};

const UserProfileSummary: React.FC<Props> = ({ edit }) => {
  const colors = useThemeColors();
  const { failedImages, handleImageError } = useFallbackImages();

  return (
    <View className="items-center gap-3 flex-1">
      <View
        className="h-[78px] relative w-[78px] border-[2px]"
        style={{
          borderRadius: 999,
          borderColor: hexToRgba(colors.text, 0.7),
        }}
      >
        <Image
          source={{
            uri: failedImages.has(0)
              ? FALLBACK_IMAGE
              : "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk",
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
        {edit && (
          <Pressable
            className="w-[18px] h-[18px] items-center justify-center rounded-full absolute -bottom-2.5 right-1/2"
            style={{
              backgroundColor: colors.shade,
              transform: [
                {
                  translateX: "50%",
                },
              ],
            }}
          >
            <VaadinPaintbrush color={colors["shade-content"]} size={9} />
          </Pressable>
        )}
      </View>
      <View className="items-center gap-1">
        <View className="flex-row items-center gap-2">
          <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 12 }}>
            Guest
          </ThemedText>
          <SolarMedalStarBold color={colors.accent} size={16} />
        </View>
        <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 15 }}>
          Uzumaki Naruto
        </ThemedText>
      </View>
    </View>
  );
};

export default UserProfileSummary;
