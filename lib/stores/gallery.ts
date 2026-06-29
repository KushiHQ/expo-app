import { create } from 'zustand';

/** Optional per-image context shown over the fullscreen viewer, aligned by index. */
export type GalleryCaption = { title?: string; subtitle?: string };

interface GalleryStore {
  gallery: string[];
  captions: GalleryCaption[];
  activeIndex: number;
  /** Maps a locally-edited (cropped/rotated) file uri → the already-uploaded URL
   *  it replaces, so the upload step can update that server image in place
   *  instead of creating a duplicate. Cleared with the gallery. */
  replacements: Record<string, string>;
  setActiveIndex: (index: number) => void;
  setGallery: (gallery: string[]) => void;
  setCaptions: (captions: GalleryCaption[]) => void;
  append: (image: string) => void;
  clearGallery: () => void;
  updateActiveImage: (image: string) => void;
  setReplacement: (editedUri: string, originalUrl: string) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  activeIndex: 0,
  gallery: [],
  captions: [],
  replacements: {},
  setActiveIndex(index) {
    set(() => ({ activeIndex: index }));
  },
  setGallery(gallery) {
    set(() => ({ gallery }));
  },
  setCaptions(captions) {
    set(() => ({ captions }));
  },
  append(image) {
    set((state) => ({ gallery: [...state.gallery, image] }));
  },
  clearGallery() {
    set(() => ({ gallery: [], captions: [], replacements: {} }));
  },
  updateActiveImage: (image) =>
    set((state) => {
      const gallery = [...state.gallery];
      gallery[state.activeIndex] = image;

      return { gallery };
    }),
  setReplacement: (editedUri, originalUrl) =>
    set((state) => ({ replacements: { ...state.replacements, [editedUri]: originalUrl } })),
}));
