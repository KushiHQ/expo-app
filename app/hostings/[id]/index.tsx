import Button from "@/components/atoms/a-button";
import Carousel from "@/components/atoms/a-carousel";
import ThemedText from "@/components/atoms/a-themed-text";
import { PhHeart } from "@/components/icons/i-heart";
import { CuidaBuildingOutline } from "@/components/icons/i-home";
import { TablerMessage2 } from "@/components/icons/i-message";
import { SolarPhoneOutline } from "@/components/icons/i-phone";
import { MynauiStarSolid } from "@/components/icons/i-start";
import DetailsLayout from "@/components/layouts/details";
import ReviewItem from "@/components/molecules/m-review-item";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { FACILITY_ICONS } from "@/lib/types/enums/hosting-icons";
import { FACILITIES_BY_VARIANT } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { Pressable, View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostingDetails() {
  const router = useRouter();
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
    <DetailsLayout
      title="Property Details"
      footer={
        <View
          className="flex-row items-center p-6"
          style={{ backgroundColor: colors.background }}
        >
          <View className="gap-1">
            <ThemedText
              style={{ fontSize: 15, color: hexToRgba(colors.text, 0.6) }}
            >
              Total Payment
            </ThemedText>
            <View className="flex-row items-center gap-2">
              <ThemedText>₦{hosting?.price.toLocaleString()}</ThemedText>
              <ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
                {hosting?.pricing}
              </ThemedText>
            </View>
          </View>
          <View className="flex-1 items-end">
            <Button
              onPress={() =>
                router.push(
                  `/hostings/${hosting?.id}/reservation/user-details/`,
                )
              }
              type="primary"
            >
              <ThemedText content="primary">Reserve Now</ThemedText>
            </Button>
          </View>
        </View>
      }
    >
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
          <SimpleGrid
            listKey={undefined}
            itemDimension={80}
            data={FACILITIES_BY_VARIANT.map((f) => f.facility)}
            renderItem={({ item }) => {
              const Icon =
                FACILITY_ICONS[cast<keyof typeof FACILITY_ICONS>(item)];
              return (
                <View className="items-center justify-center py-1">
                  <View
                    className="w-6 h-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: hexToRgba(colors.primary, 0.3) }}
                  >
                    <Icon color={colors.primary} size={14} />
                  </View>
                  <ThemedText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 12 }}
                  >
                    {item}
                  </ThemedText>
                </View>
              );
            }}
          />
        </View>
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
                  <ThemedText
                    style={{ fontFamily: Fonts.medium, fontSize: 14 }}
                  >
                    More +
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>
        <View className="mt-8 mb-4">
          <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
            Reviews
          </ThemedText>
          <View
            className="mt-4 gap-3 p-4 rounded-xl"
            style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
          >
            <ReviewItem
              value={3.2}
              title="Cleanliness"
              description="This rating measures how tidy and sanitary the hosting was. A high score means the space was spotless, well-maintained, and hygienic upon arrival."
            />
            <ReviewItem
              value={4.6}
              title="Accuracy"
              description="This rating assesses how well the hosting's description and photos matched the actual property. A high score means there were no surprises and the listing was exactly as advertised."
            />
            <ReviewItem
              value={3.7}
              title="Communication"
              description="This rating reflects the host's responsiveness and helpfulness. A good score indicates the host was easy to reach, answered questions promptly, and provided clear instructions."
            />
            <ReviewItem
              value={4.1}
              title="Location"
              description="This rating evaluates the convenience and appeal of the hosting's location. A high score means the area was safe, accessible, and close to desired attractions or services."
            />
            <ReviewItem
              value={4.4}
              title="Check-In"
              description="This rating measures how smooth and easy the check-in process was. A high score means the instructions were clear, the host was accommodating, and access to the property was seamless."
            />
            <ReviewItem
              value={2.8}
              title="Value"
              description="This rating determines if the price of the hosting was fair for the quality of the experience. A high score means the user felt they received excellent quality and amenities for the price they paid."
            />
          </View>
        </View>
      </View>
    </DetailsLayout>
  );
}
