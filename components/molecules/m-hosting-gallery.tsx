import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { Hosting } from "@/lib/constants/mocks/hostings";
import React from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
  hosting?: Hosting;
};

const HostingGalleryComponent: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();
  const [failedImages, setFailedImages] = React.useState<Set<number>>(
    new Set(),
  );

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between">
        <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
          Gallery
        </ThemedText>
        <Link href={`/hostings/${hosting?.id}/gallery/`}>
          <ThemedText
            className="underline"
            content="tinted"
            style={{ fontSize: 12 }}
          >
            See All
          </ThemedText>
        </Link>
      </View>
      <View className="mt-4 flex-row gap-3">
        {(hosting?.images ?? []).slice(0, 3).map((img, index) => (
          <View key={index} className="flex-1">
            <Image
              source={{
                uri: failedImages.has(index) ? FALLBACK_IMAGE : img,
              }}
              style={{
                height: 80,
                width: "100%",
                borderRadius: 12,
                maxWidth: 150,
              }}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
              onError={() => handleImageError(index)}
            />
          </View>
        ))}
        {(hosting?.images ?? []).length > 3 && (
          <View className="flex-1 relative">
            <Image
              source={{
                uri: hosting?.images.at((hosting.images ?? []).length - 1),
              }}
              style={{
                height: 80,
                width: "100%",
                borderRadius: 12,
                maxWidth: 150,
              }}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
            <View
              className="flex-1 items-center absolute justify-center rounded-xl inset-0"
              style={{ backgroundColor: hexToRgba(colors.accent, 0.8) }}
            >
              <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
                More +
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default HostingGalleryComponent;
