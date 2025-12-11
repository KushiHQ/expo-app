import ListImage from "@/components/atoms/a-list-image";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { useHostingQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";

export default function HostingGallery() {
  const { id } = useLocalSearchParams();
  const [{ data }] = useHostingQuery({ variables: { hostingId: cast(id) } });

  const hosting = data?.hosting;

  const images =
    data?.hosting.rooms
      .map((r) => r.images)
      .flat()
      .map((i) => i.asset.publicUrl) ?? [];

  const getIndex = (src: string) => {
    const index = images.findIndex((c) => c === src);
    if (index < 0) {
      return 0;
    }
    return index;
  };
  return (
    <DetailsLayout title="Property Gallery">
      <View className="">
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
                  renderItem={({ item }) => {
                    return (
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
                          openable
                          src={item.asset.publicUrl}
                          index={getIndex(item.asset.publicUrl)}
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
