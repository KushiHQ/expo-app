import atomWithStorageStorage from "./utils";
import ATOM_KEYS from "../constants/atom-keys";

export const galleryAtom = atomWithStorageStorage(
	ATOM_KEYS.GALLERY,
	[] as string[],
);
