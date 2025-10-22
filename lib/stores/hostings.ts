import { atom } from "jotai";
import ATOM_KEYS from "../constants/atom-keys";
import { Hosting } from "../constants/mocks/hostings";
import atomWithStorageStorage from "./utils";
import { Room } from "../types/enums/hostings";

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
