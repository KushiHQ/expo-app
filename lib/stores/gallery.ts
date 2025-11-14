import { create } from "zustand";

interface GalleryStore {
	gallery: string[];
	activeIndex: number;
	setActiveIndex: (index: number) => void;
	setGallery: (gallery: string[]) => void;
	append: (image: string) => void;
	clearGallery: () => void;
	updateActiveImage: (image: string) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
	activeIndex: 0,
	gallery: [],
	setActiveIndex(index) {
		set(() => ({ activeIndex: index }));
	},
	setGallery(gallery) {
		set(() => ({ gallery }));
	},
	append(image) {
		set((state) => ({ gallery: [...state.gallery, image] }));
	},
	clearGallery() {
		set(() => ({ gallery: [] }));
	},
	updateActiveImage: (image) =>
		set((state) => {
			const gallery = [...state.gallery];
			gallery[state.activeIndex] = image;

			return { gallery };
		}),
}));
