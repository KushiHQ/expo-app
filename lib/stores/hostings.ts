import { create } from 'zustand';
import { Room } from '../types/enums/hostings';
import {
  HostingFilterInput,
  HostingInput,
  HostingQuery,
  HostingVerificationInput,
} from '../services/graphql/generated';
import { cleanupAgreementTemplateInput } from '../utils/hosting/tenancyAgreement';

export type RoomData = {
  id?: string;
  description?: string;
  count: number;
  name: keyof typeof Room;
  images: string[];
};

interface HostingRoomsStore {
  rooms: RoomData[];
  activeIndex: number;
  readonly activeRoom?: RoomData;
  setRooms: (rooms: RoomData[]) => void;
  setActiveIndex: (index: number) => void;
  saveRoom: (value: keyof typeof Room, index: number) => void;
  updateActiveRoom: (room: Partial<RoomData>) => void;
  updateRoom: (index: number, room: Partial<RoomData>) => void;
  deleteRoomImage: (roomIndex: number, imageIndex: number) => void;
  deleteRoom: (roomIndex: number) => void;
  updateActiveRoomImage: (imageIndex: number, image: string) => void;
  /** Swap an image URL (e.g. local file:// → uploaded https://) in a room by id,
   *  independent of which room is active. Used by the background upload queue. */
  replaceRoomImageUrl: (roomId: string, fromUrl: string, toUrl: string) => void;
  moveRoom: (from: number, to: number) => void;
  moveRoomImage: (roomIndex: number, from: number, to: number) => void;
}

export const useHostingRoomsStore = create<HostingRoomsStore>((set, get) => ({
  activeIndex: 0,
  get activeRoom() {
    const { rooms, activeIndex } = get();
    return rooms[activeIndex];
  },
  rooms: [],
  setRooms: (rooms) => set(() => ({ rooms })),
  setActiveIndex(index) {
    set(() => ({ activeIndex: index }));
  },
  saveRoom: (value, index) =>
    set((state) => {
      const rooms = [...state.rooms];
      if (rooms[index]) {
        rooms[index].name = value;
      } else {
        rooms[index] = { name: value, images: [], count: 0 };
      }

      return {
        rooms,
      };
    }),
  updateActiveRoom(room) {
    set((state) => {
      const rooms = [...state.rooms];
      const roomData = rooms[state.activeIndex];
      rooms[state.activeIndex] = { ...roomData, ...room };

      return { rooms };
    });
  },
  updateRoom(index, room) {
    set((state) => {
      const rooms = [...state.rooms];
      const roomData = rooms[index];
      rooms[index] = { ...roomData, ...room };

      return { rooms };
    });
  },
  deleteRoomImage(roomIndex, imageIndex) {
    set((state) => {
      const rooms = [...state.rooms];
      const currentImages = rooms[roomIndex].images;
      rooms[roomIndex].images = currentImages.filter((_, i) => i !== imageIndex);

      return { rooms };
    });
  },
  deleteRoom(roomIndex) {
    set((state) => {
      const rooms = state.rooms.filter((_, i) => i !== roomIndex);

      return { rooms };
    });
  },
  updateActiveRoomImage(imageIndex, image) {
    set((state) => {
      const rooms = [...state.rooms];
      rooms[state.activeIndex].images[imageIndex] = image;

      return { rooms };
    });
  },
  replaceRoomImageUrl(roomId, fromUrl, toUrl) {
    set((state) => {
      // No-op (same state object → zustand skips notify) when nothing matched,
      // so upload completions for other hostings/rooms don't wake the whole
      // photo wizard.
      let changed = false;
      const rooms = state.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const idx = room.images.indexOf(fromUrl);
        if (idx === -1) return room;
        const images = [...room.images];
        images[idx] = toUrl;
        changed = true;
        return { ...room, images };
      });
      return changed ? { rooms } : state;
    });
  },
  moveRoom(from, to) {
    set((state) => {
      if (from === to || from < 0 || to < 0) return state;
      const rooms = [...state.rooms];
      if (from >= rooms.length || to >= rooms.length) return state;
      const [moved] = rooms.splice(from, 1);
      rooms.splice(to, 0, moved);
      return { rooms };
    });
  },
  moveRoomImage(roomIndex, from, to) {
    set((state) => {
      if (from === to || from < 0 || to < 0) return state;
      const rooms = [...state.rooms];
      const room = rooms[roomIndex];
      if (!room) return state;
      const images = [...room.images];
      if (from >= images.length || to >= images.length) return state;
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      rooms[roomIndex] = { ...room, images };
      return { rooms };
    });
  },
}));

interface HostingFilterStore {
  filter: HostingFilterInput;
  setFilter: (filter: HostingFilterInput) => void;
  updateFilter: (partialFilter: Partial<HostingFilterInput>) => void;
  resetFilter: () => void;
}

export const useHostingFilterStore = create<HostingFilterStore>((set) => ({
  filter: {},
  setFilter: (filter) => set({ filter }),
  updateFilter: (partialFilter) =>
    set((state) => {
      const hasChanged = Object.entries(partialFilter).some(([key, value]) => {
        const current = state.filter[key as keyof HostingFilterInput];
        return JSON.stringify(current) !== JSON.stringify(value);
      });

      if (!hasChanged) return state;

      return { filter: { ...state.filter, ...partialFilter } };
    }),
  resetFilter: () => set({ filter: {} }),
}));

interface ActiveFormHostingStore {
  input: HostingInput;
  verificationInput: Partial<HostingVerificationInput>;
  hosting?: HostingQuery['hosting'];
  initiate: (hosting: HostingQuery['hosting']) => void;
  refreshHosting: (hosting: HostingQuery['hosting']) => void;
  updateInput: (data: Partial<HostingInput>) => void;
  updateVerificationInput: (data: Partial<HostingVerificationInput>) => void;
  clear: () => void;
}

export const useActiveFormHosingStore = create<ActiveFormHostingStore>((set, get) => ({
  input: {} as HostingInput,
  verificationInput: {} as HostingVerificationInput,
  hosting: {} as HostingQuery['hosting'],

  initiate: (hosting) => {
    // No-op when the incoming hosting is unchanged — initiate() deep-spreads the
    // whole hosting and runs on every refocus, so guarding it avoids needless
    // state churn / re-renders (WS-12).
    const prev = get().hosting;
    if (prev && prev.id && prev.id === hosting.id && prev.lastUpdated === hosting.lastUpdated) {
      return;
    }

    const {
      host,
      lastUpdated,
      createdAt,
      totalRatings,
      coverImage,
      paymentDetails,
      rooms,
      saved,
      reviews,
      reviewAverage,
      parent,
      childCount,
      children,
      isBookable,
      priceFrom,
      tenancyAgreementTemplate,
      __typename,
      verification,
      images,
      video,
      bookingApplicationsCount,
      ...rest
    } = hosting;

    const {
      __typename: __vTypeName,
      verificationTier,
      createdAt: createdAt2,
      lastUpdated: lastUpdated2,
      tierTooltip,
      ...vRest
    } = verification ?? {};

    set(() => ({
      input: {
        ...rest,
        tenancyAgreementTemplate: cleanupAgreementTemplateInput(
          tenancyAgreementTemplate ?? { sections: [], totalSections: 0 },
        ),
        paymentDetailsId: paymentDetails?.id,
      },
      verificationInput: { hostingId: hosting.id, ...vRest },
      hosting,
    }));
  },
  // Identity-guarded: all mounted useHostingForm instances share one urql
  // operation, so their [data] effects pass the SAME object — skipping the
  // write collapses M redundant sets (and the O(M²) cross-screen re-render
  // burst at upload-drain refetch time) into one.
  refreshHosting: (hosting) => set((state) => (state.hosting === hosting ? state : { hosting })),
  updateInput: (data) =>
    set((state) => ({
      input: { ...state.input, ...data },
    })),
  updateVerificationInput: (data) =>
    set((state) => ({
      verificationInput: {
        ...state.verificationInput,
        ...data,
      },
    })),
  clear: () =>
    set({
      input: {} as HostingInput,
      verificationInput: {} as Partial<HostingVerificationInput>,
      hosting: undefined,
    }),
}));
