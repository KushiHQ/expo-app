import ATOM_KEYS from "../constants/atom-keys";
import { UserStore } from "../types/users";
import atomWithStorageStorage from "./utils";

const DEFAULT_USER: UserStore = {};

export const userAtom = atomWithStorageStorage(ATOM_KEYS.USER, DEFAULT_USER);
