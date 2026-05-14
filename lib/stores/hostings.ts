import { create } from "zustand";
import { Room } from "../types/enums/hostings";
import {
	HostingFilterInput,
	HostingInput,
	HostingQuery,
	HostingVerificationInput,
} from "../services/graphql/generated";
import { cleanupAgreementTemplateInput } from "../utils/hosting/tenancyAgreement";

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
			rooms[state.activeIndex] = { ...room, ...roomData };

			return { rooms };
		});
	},
	deleteRoomImage(roomIndex, imageIndex) {
		set((state) => {
			const rooms = [...state.rooms];
			const currentImages = rooms[roomIndex].images;
			rooms[roomIndex].images = currentImages.filter(
				(_, i) => i !== imageIndex,
			);

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
	hosting?: HostingQuery["hosting"];
	initiate: (hosting: HostingQuery["hosting"]) => void;
	updateInput: (data: Partial<HostingInput>) => void;
	updateVerificationInput: (data: Partial<HostingVerificationInput>) => void;
	clear: () => void;
}

export const useActiveFormHosingStore = create<ActiveFormHostingStore>(
	(set) => ({
		input: {} as HostingInput,
		verificationInput: {} as HostingVerificationInput,
		hosting: {} as HostingQuery["hosting"],

		initiate: (hosting) => {
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
				tenancyAgreementTemplate,
				__typename,
				verification,
				...rest
			} = hosting;

			const {
				__typename: __vTypeName,
				verificationTier,
				createdAt: createdAt2,
				lastUpdated: lastUpdated2,
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
		clear: () => set({ input: undefined, hosting: undefined }),
	}),
);
