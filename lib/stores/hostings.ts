import { atom } from "jotai";
import { create } from "zustand";
import ATOM_KEYS from "../constants/atom-keys";
import { Hosting } from "../constants/mocks/hostings";
import atomWithStorageStorage from "./utils";
import { Room } from "../types/enums/hostings";
import { HostingFilterInput } from "../services/graphql/generated";

const DEFAULT_HOSTINGS: Hosting[] = [];

export const hostingsAtom = atomWithStorageStorage(
	ATOM_KEYS.HOSTINGS,
	DEFAULT_HOSTINGS,
);

export type RoomData = {
	room: keyof typeof Room;
	images: string[];
};

export const hostingRoomsEditAtom = atom<{
	activeIndex: number;
	rooms: RoomData[];
}>({ activeIndex: 0, rooms: [] });

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
		set((state) => ({ filter: { ...state.filter, ...partialFilter } })),
	resetFilter: () => set({ filter: {} }),
}));
