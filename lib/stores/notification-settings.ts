import ATOM_KEYS from "../constants/atom-keys";
import atomWithStorageStorage from "./utils";

export const DEFAULT_NOTIFICATION_SETTINGS = {
	general: false,
	sound: false,
	vibrate: false,
	specialOffers: false,
	appUpdates: false,
	sms: false,
	inApp: false,
	email: false,
};

export const notificationSettingsAtom = atomWithStorageStorage(
	ATOM_KEYS.NOTIFICATION_SETTINGS,
	DEFAULT_NOTIFICATION_SETTINGS,
);
