import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { HostingQuery } from "@/lib/services/graphql/generated";
import ListImage from "../atoms/a-list-image";

type Props = {
  hosting?: HostingQuery["hosting"];
};

const HostingGalleryComponent: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  const images = hosting?.rooms.map((r) => r.images).flat();

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
        {(images ?? []).slice(0, 3).map((img, index) => (
          <View key={index} className="flex-1">
            <ListImage
              width="100%"
              height={80}
              style={{
                height: 80,
                width: "100%",
                borderRadius: 12,
                maxWidth: 150,
              }}
              images={images?.map((v) => v.asset.publicUrl)}
              openable
              src={img.asset.publicUrl}
              index={index}
            />
          </View>
        ))}
        {(images ?? []).length > 3 && (
          <View className="flex-1 relative">
            <Image
              source={{
                uri: (images ?? []).at((images ?? []).length - 1)?.asset
                  .publicUrl,
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
