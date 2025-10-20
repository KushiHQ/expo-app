import ATOM_KEYS from "../constants/atom-keys";
import { Notification } from "../constants/mocks/notifications";
import atomWithStorageStorage from "./utils";

const DEFAULT_NOTIFICATIONS: Notification[] = [];

export const notificationsAtom = atomWithStorageStorage(
	ATOM_KEYS.BOOKINGS,
	DEFAULT_NOTIFICATIONS,
);
