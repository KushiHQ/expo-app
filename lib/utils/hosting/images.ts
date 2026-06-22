import { HostingQuery } from "@/lib/services/graphql/generated";
import { Room } from "@/lib/types/enums/hostings";

export function extractHostingImages(hosting?: HostingQuery["hosting"]) {
  const images =
    hosting?.rooms
      .map((r) => r.images)
      .flat()
      .map((i) => i.asset.publicUrl) ?? [];

  const captions =
    hosting?.rooms.flatMap((room) =>
      room.images.map(() => ({
        title: Room[room.name as keyof typeof Room] ?? room.name,
        subtitle: room.description ?? undefined,
      })),
    ) ?? [];

  return { images, captions };
}
