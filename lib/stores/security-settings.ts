import ATOM_KEYS from "../constants/atom-keys";
import atomWithStorageStorage from "./utils";

export const securitySettingsAtom = atomWithStorageStorage(
	ATOM_KEYS.SECURITY_SETTINGS,
	{
		biometrics: false,
		payWithBiometrics: false,
		kyc: false,
	},
);
