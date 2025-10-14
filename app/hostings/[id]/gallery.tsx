import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { hostingsAtom } from "@/lib/stores/hostings";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

const ROOMS = ["Exterior", "Living Room", "Bedroom", "Balcony"];

export default function HostingGallery() {
  const { id } = useLocalSearchParams();
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
        <View className="px-2">
          <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
            Galery
          </ThemedText>
        </View>
        <View>
          {ROOMS.map((room, index) => (
            <View key={index} className="mt-4">
              <View className="px-2">
                <ThemedText>{room}</ThemedText>
              </View>
              <View>
                <SimpleGrid
                  listKey={undefined}
                  itemDimension={80}
                  data={(hosting?.images ?? []).slice(0, index + 1)}
                  renderItem={({ item }) => {
                    return (
                      <View key={index} className="w-full">
                        <Image
                          source={{
                            uri: failedImages.has(index)
                              ? FALLBACK_IMAGE
                              : item,
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
                    );
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </DetailsLayout>
  );
}
