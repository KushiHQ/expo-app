import ATOM_KEYS from "../constants/atom-keys";
import { Chat } from "../constants/mocks/chat";
import atomWithStorageStorage from "./utils";

const DEFAULT_CHATS: Chat[] = [];

export const chatsAtom = atomWithStorageStorage(ATOM_KEYS.CHATS, DEFAULT_CHATS);
