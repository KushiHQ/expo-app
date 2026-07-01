import { View, Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import SectionHeader from "@/components/atoms/a-section-header";
import { Images } from "lucide-react-native";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { hexToRgba } from "@/lib/utils/colors";
import { HostingQuery } from "@/lib/services/graphql/generated";
import ListImage from "../atoms/a-list-image";
import VideoCard from "./m-video-card";
import { extractHostingImages } from "@/lib/utils/hosting/images";

type Props = {
  hosting?: HostingQuery["hosting"];
};

const HostingGalleryComponent: React.FC<Props> = ({ hosting }) => {
  const { captions, images } = React.useMemo(
    () => extractHostingImages(hosting),
    [hosting],
  );

  return (
    <View className="mt-8">
      <SectionHeader
        icon={Images}
        title="Gallery"
        action={
          <Link href={`/hostings/${hosting?.id}/gallery/`}>
            <ThemedText
              className="underline"
              content="tinted"
              style={{ fontSize: 12 }}
            >
              See All
            </ThemedText>
          </Link>
        }
      />
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
          <Link href={`/hostings/${hosting?.id}/gallery/`} asChild>
            <Pressable className="relative flex-1">
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
                className="absolute inset-0 items-center justify-center"
                style={{
                  borderRadius: 12,
                  maxWidth: 150,
                  backgroundColor: hexToRgba("#000000", 0.55),
                }}
              >
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14, color: "#fff" }}>
                  +{(images ?? []).length - 3} more
                </ThemedText>
              </View>
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
};

export default HostingGalleryComponent;
