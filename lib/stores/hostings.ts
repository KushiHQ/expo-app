import ATOM_KEYS from "../constants/atom-keys";
import { Hosting } from "../constants/mocks/hostings";
import atomWithStorageStorage from "./utils";

const DEFAULT_HOSTINGS: Hosting[] = [];

export const hostingsAtom = atomWithStorageStorage(
	ATOM_KEYS.HOSTINGS,
	DEFAULT_HOSTINGS,
);
