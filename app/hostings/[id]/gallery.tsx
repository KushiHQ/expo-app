import ListImage from "@/components/atoms/a-list-image";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { ROOM_ICONS } from "@/components/organisms/o-room-item-card";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useHostingQuery } from "@/lib/services/graphql/generated";
import { Room } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { SURFACE } from "@/lib/constants/surface";
import { extractHostingImages, galleryImageUri } from "@/lib/utils/hosting/images";
import { getAssetResizeUrl } from "@/lib/utils/urls";
import { Home, Images } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostingGallery() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });

  const hosting = data?.hosting;
  const { captions, images } = React.useMemo(() => extractHostingImages(hosting), [hosting]);

  const getIndex = (src: string) => {
    const index = images.findIndex((c) => c === src);
    return index < 0 ? 0 : index;
  };

  // Only rooms that actually have photos are worth a section.
  const rooms = (hosting?.rooms ?? []).filter((r) => (r.images?.length ?? 0) > 0);

  return (
    <DetailsLayout title="Property Gallery">
      <View className="gap-5 pb-8">
        {/* Overview line */}
        <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.5), fontFamily: Fonts.medium }}>
          {images.length} {images.length === 1 ? "photo" : "photos"} across {rooms.length}{" "}
          {rooms.length === 1 ? "space" : "spaces"}
        </ThemedText>

        {rooms.map((room) => {
          const photoCount = room.images?.length ?? 0;
          const RoomIcon = ROOM_ICONS[room.name as keyof typeof Room] ?? Home;
          return (
            <View
              key={room.id}
              className="gap-3.5 rounded-3xl p-4"
              style={{
                backgroundColor: hexToRgba(colors.text, 0.05),
                boxShadow: SURFACE.shadow,
              }}
            >
              {/* Room header: icon chip + name (+ ×count) with photo count on the right */}
              <View className="flex-row items-center gap-2.5">
                <View
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
                >
                  <RoomIcon size={15} color={colors.primary} />
                </View>
                <View className="flex-1 flex-row items-center gap-2">
                  <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 16, letterSpacing: -0.3 }}>
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
                        style={{ fontSize: 11, fontFamily: Fonts.semibold, color: colors.primary }}
                      >
                        ×{room.count}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <View
                  className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
                >
                  <Images size={11} color={hexToRgba(colors.text, 0.5)} />
                  <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.55), fontFamily: Fonts.semibold }}>
                    {photoCount}
                  </ThemedText>
                </View>
              </View>

              {room.description ? (
                <ThemedText
                  numberOfLines={2}
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: hexToRgba(colors.text, 0.6),
                    marginTop: -4,
                  }}
                >
                  {room.description}
                </ThemedText>
              ) : null}

              <SimpleGrid
                listKey={room.id}
                itemDimension={100}
                spacing={8}
                style={{ margin: -4 }}
                data={room.images ?? []}
                renderItem={({ item }) => (
                  <ListImage
                    key={item.id}
                    width="100%"
                    height={100}
                    style={{ height: 100, width: "100%", borderRadius: 14 }}
                    images={images}
                    captions={captions}
                    openable
                    src={
                      item.asset.id
                        ? getAssetResizeUrl(item.asset.id, 240, 240, 80, item.asset.lastUpdated)
                        : item.asset.publicUrl
                    }
                    index={getIndex(galleryImageUri(item.asset))}
                  />
                )}
              />
            </View>
          );
        })}
      </View>
    </DetailsLayout>
  );
}
