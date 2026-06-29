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
import VideoCard from "./m-video-card";
import { extractHostingImages } from "@/lib/utils/hosting/images";

type Props = {
  hosting?: HostingQuery["hosting"];
};

const HostingGalleryComponent: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  const { captions, images } = React.useMemo(
    () => extractHostingImages(hosting),
    [hosting],
  );

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
      {hosting?.video?.asset?.publicUrl && (
        <View className="mt-4">
          <VideoCard
            source={hosting.video.asset.publicUrl}
            durationSeconds={hosting.video.durationSeconds ?? undefined}
            title="Property tour"
            style={{ width: "100%", height: 200, borderRadius: 12 }}
          />
        </View>
      )}
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
              images={images}
              captions={captions}
              openable
              src={img}
              index={index}
            />
          </View>
        ))}
        {(images ?? []).length > 3 && (
          <View className="relative flex-1">
            <Image
              source={{
                uri: (images ?? []).at((images ?? []).length - 1),
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
              className="absolute inset-0 flex-1 items-center justify-center rounded-xl"
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
