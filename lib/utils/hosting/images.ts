import { HostingQuery } from "@/lib/services/graphql/generated";
import { Room } from "@/lib/types/enums/hostings";
import { getAssetResizeUrl } from "@/lib/utils/urls";

/** Full-screen viewer source for a room image — resized WebP via the proxy. */
export function galleryImageUri(asset: { id?: string; publicUrl: string }) {
  return asset.id ? getAssetResizeUrl(asset.id, 1600, 1600, 85) : asset.publicUrl;
}

export function extractHostingImages(hosting?: HostingQuery["hosting"]) {
  const images =
    hosting?.rooms
      .map((r) => r.images)
      .flat()
      .map((i) => galleryImageUri(i.asset)) ?? [];

  const captions =
    hosting?.rooms.flatMap((room) =>
      room.images.map(() => ({
        title: Room[room.name as keyof typeof Room] ?? room.name,
        subtitle: room.description ?? undefined,
      })),
    ) ?? [];

  return { images, captions };
}
