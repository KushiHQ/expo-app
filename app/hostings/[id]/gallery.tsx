import ListImage from "@/components/atoms/a-list-image";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useHostingQuery } from "@/lib/services/graphql/generated";
import { Room } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { extractHostingImages, galleryImageUri } from "@/lib/utils/hosting/images";
import { getAssetResizeUrl } from "@/lib/utils/urls";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostingGallery() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });

  const hosting = data?.hosting;
  const { captions, images } = React.useMemo(
    () => extractHostingImages(hosting),
    [hosting],
  );

  const getIndex = (src: string) => {
    const index = images.findIndex((c) => c === src);
    return index < 0 ? 0 : index;
  };

  return (
    <DetailsLayout title="Property Gallery">
      <View>
        {hosting?.rooms.map((room) => {
          const photoCount = room.images?.length ?? 0;
          return (
            <View key={room.id} className="mt-6">
              {/* Room section header: name + space count + photo count + description */}
              <View className="px-2">
                <View className="flex-row flex-wrap items-center gap-2">
                  <ThemedText
                    style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
                  >
                    {Room[room.name as keyof typeof Room] ?? room.name}
                  </ThemedText>
                  {room.count && room.count > 1 ? (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: hexToRgba(colors.primary, 0.12),
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 11,
                          fontFamily: Fonts.semibold,
                          color: colors.primary,
                        }}
                      >
                        ×{room.count}
                      </ThemedText>
                    </View>
                  ) : null}
                  <ThemedText
                    style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4) }}
                  >
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                  </ThemedText>
                </View>
                {room.description ? (
                  <ThemedText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: hexToRgba(colors.text, 0.6),
                      marginTop: 4,
                    }}
                  >
                    {room.description}
                  </ThemedText>
                ) : null}
              </View>

              <View className="mt-3">
                <SimpleGrid
                  listKey={room.id}
                  itemDimension={80}
                  data={room.images ?? []}
                  renderItem={({ item }) => (
                    <View key={item.id} className="w-full">
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
                        src={
                          item.asset.id
                            ? getAssetResizeUrl(item.asset.id, 200, 200, 80)
                            : item.asset.publicUrl
                        }
                        index={getIndex(galleryImageUri(item.asset))}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
          );
        })}
      </View>
    </DetailsLayout>
  );
}
