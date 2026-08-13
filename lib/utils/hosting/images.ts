import { HostingQuery } from '@/lib/services/graphql/generated';
import { Room } from '@/lib/types/enums/hostings';
import { getAssetResizeUrl } from '@/lib/utils/urls';

/** Full-screen viewer source for a room image — resized WebP via the proxy. */
export function galleryImageUri(asset: { id?: string; publicUrl: string }) {
  return asset.id ? getAssetResizeUrl(asset.id, 1600, 1600, 85) : asset.publicUrl;
}

export function extractHostingImages(hosting?: HostingQuery['hosting']) {
  const roomImages =
    hosting?.rooms
      .map((r) => r.images)
      .flat()
      .map((i) => galleryImageUri(i.asset)) ?? [];

  const roomCaptions =
    hosting?.rooms.flatMap((room) =>
      room.images.map(() => ({
        title: Room[room.name as keyof typeof Room] ?? room.name,
        subtitle: room.description ?? undefined,
      })),
    ) ?? [];

  // Posters (land development renders) are listing imagery too. Everything that
  // shows a hosting's photos reads from here — the detail hero, its "+N more"
  // grid and the fullscreen gallery — so a land plot whose imagery is only
  // posters rendered an empty hero and an empty gallery without this.
  // Captioned as an impression so a render is never mistaken for the real site.
  const posters = hosting?.hostingImages ?? [];
  const posterImages = posters.map((p) => galleryImageUri(p.asset));
  const posterCaptions = posters.map((p) => ({
    title: 'Proposed development',
    subtitle: p.caption ?? "Artist's impression — not the current state of the land",
  }));

  return {
    images: [...roomImages, ...posterImages],
    captions: [...roomCaptions, ...posterCaptions],
  };
}
