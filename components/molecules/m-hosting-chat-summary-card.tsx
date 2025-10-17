import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Hosting } from "@/lib/constants/mocks/hostings";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { useRouter } from "expo-router";

type Props = {
  hosting: Hosting;
};

const HostingChatSummaryCard: React.FC<Props> = ({ hosting }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { handleImageError, failedImages } = useFallbackImages();
  const img = hosting.images.at(0);

  return (
    <Pressable
      onPress={() => router.push(`/hostings/${hosting.id}`)}
      className="flex-row justify-center gap-4 items-center p-6 rounded-xl"
      style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
    >
      <View
        className="max-w-[120px] border rounded-xl h-[90px] flex-1"
        style={{ borderColor: hexToRgba(colors.text, 0.6) }}
      >
        <Image
          source={{ uri: failedImages.has(0) ? FALLBACK_IMAGE : img }}
          style={{ height: "100%", width: "100%", borderRadius: 12 }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          onError={() => handleImageError(0)}
        />
      </View>
      <View
        className="flex-[1.5] max-w-[160px] rounded-xl border p-2 h-[90px] justify-between"
        style={{ borderColor: hexToRgba(colors.text, 0.6) }}
      >
        <ThemedText
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{ fontSize: 14, fontFamily: Fonts.medium }}
        >
          {hosting.title}
        </ThemedText>
        <ThemedText
          ellipsizeMode="tail"
          numberOfLines={2}
          style={{ color: hexToRgba(colors.text, 0.6), fontSize: 12 }}
        >
          {hosting.city}, {hosting.address}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, fontFamily: Fonts.medium }}>
          ₦{hosting.price.toLocaleString()} {hosting.pricing}
        </ThemedText>
      </View>
    </Pressable>
  );
};

export default HostingChatSummaryCard;
