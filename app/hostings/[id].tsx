import Carousel from "@/components/atoms/a-carousel";
import ThemedText from "@/components/atoms/a-themed-text";
import { PhHeart } from "@/components/icons/i-heart";
import { CuidaBuildingOutline } from "@/components/icons/i-home";
import { TablerMessage2 } from "@/components/icons/i-message";
import { SolarPhoneOutline } from "@/components/icons/i-phone";
import { MynauiStarSolid } from "@/components/icons/i-start";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, View } from "react-native";

const PROPERTY_BLURHASH = "LKO2?U%2Tw=w]~RBVZRi};RPxuwH";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560185127-6a7e5ad8e19c?w=800&h=600&fit=crop&q=80";

export default function HostingDetails() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const hostings = useAtomValue(hostingsAtom);
  const hosting = hostings.find((hosting) => hosting.id === id);
  const [failedImages, setFailedImages] = React.useState<Set<number>>(
    new Set(),
  );

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <DetailsLayout title="Property Details">
      <View className="mt-8">
        <View style={{ height: 290 }} className="overflow-hidden rounded-xl">
          <Carousel autoplay style={{ height: "100%", width: "100%" }}>
            {(hosting?.images ?? []).map((img, index) => (
              <Image
                source={{ uri: failedImages.has(index) ? FALLBACK_IMAGE : img }}
                style={{ height: "100%", width: "100%" }}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: PROPERTY_BLURHASH }}
                placeholderContentFit="cover"
                cachePolicy="memory-disk"
                priority="high"
                onError={() => handleImageError(index)}
                key={index}
              />
            ))}
          </Carousel>
        </View>
        <View className="mt-8">
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <ThemedText
                numberOfLines={1}
                ellipsizeMode="tail"
                type="title"
                className="max-w-[80%]"
                style={{ fontSize: 18 }}
              >
                {hosting?.title}
              </ThemedText>
              <PhHeart color={colors.text} />
            </View>
            <ThemedText style={{ fontSize: 14, fontFamily: Fonts.light }}>
              {hosting?.city}, {hosting?.state}
            </ThemedText>
            <View className="flex-row items-center gap-1">
              <MynauiStarSolid size={14} color={colors.accent} />
              <ThemedText style={{ fontSize: 14 }}>
                {hosting?.averageRating.toFixed(2)}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, fontFamily: Fonts.light }}>
                ({hosting?.ratingCount} Reviews)
              </ThemedText>
            </View>
          </View>
          <View
            className="mt-8 border-b pb-8"
            style={{ borderColor: hexToRgba(colors.text, 0.1) }}
          >
            <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
              Description
            </ThemedText>
            <ThemedText
              className="mt-4"
              style={{
                fontSize: 14,
                fontFamily: Fonts.light,
                color: hexToRgba(colors.text, 0.7),
              }}
            >
              {hosting?.description}
            </ThemedText>
          </View>
        </View>
        <View
          className="mt-8 pb-8 border-b"
          style={{
            borderColor: hexToRgba(colors.text, 0.1),
          }}
        >
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
                      uri: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk",
                    }}
                  />
                </View>
                <ThemedText>{hosting?.createdBy}</ThemedText>
              </View>
              <View className="flex-row items-center gap-2">
                <CuidaBuildingOutline color={colors.accent} />
                <ThemedText>{hosting?.creatorYears} years</ThemedText>
              </View>
            </View>
            <View className="flex-row gap-4 items-center">
              <Pressable
                className="flex-1 rounded items-center p-1 justify-center"
                aria-label="Message"
                style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
              >
                <TablerMessage2 color={colors.accent} />
              </Pressable>
              <Pressable
                className="flex-1 rounded items-center p-1 justify-center"
                aria-label="Call"
                style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
              >
                <SolarPhoneOutline color={colors.accent} />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="mt-8">
          <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
            Facilities
          </ThemedText>
        </View>
      </View>
    </DetailsLayout>
  );
}
