import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useFallbackImages } from "@/lib/hooks/images";
import { useHostingQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostingGallery() {
  const { id } = useLocalSearchParams();
  const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });
  const { failedImages, handleImageError } = useFallbackImages();

  const hosting = data?.hosting;
  return (
    <DetailsLayout title="Property Details">
      <View className="mt-8">
        <View className="px-2">
          <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
            Galery
          </ThemedText>
        </View>
        <View>
          {hosting?.rooms.map((room) => (
            <View key={room.id} className="mt-4">
              <View className="px-2">
                <ThemedText>{room.name}</ThemedText>
              </View>
              <View>
                <SimpleGrid
                  listKey={undefined}
                  itemDimension={80}
                  data={room.images ?? []}
                  renderItem={({ item, index }) => {
                    return (
                      <View key={item.id} className="w-full">
                        <Image
                          source={{
                            uri: failedImages.has(index)
                              ? FALLBACK_IMAGE
                              : item.asset.publicUrl,
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
