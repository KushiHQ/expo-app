import ATOM_KEYS from "../constants/atom-keys";
import atomWithStorageStorage from "./utils";

export const notificationSettingsAtom = atomWithStorageStorage(
	ATOM_KEYS.NOTIFICATION_SETTINGS,
	{
		general: false,
		sound: false,
		vibrate: false,
		specialOffers: false,
		appUpdates: false,
		sms: false,
		inApp: false,
		email: false,
	},
);
