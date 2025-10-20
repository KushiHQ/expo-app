import ATOM_KEYS from "../constants/atom-keys";
import atomWithStorageStorage from "./utils";

export const DEFAULT_SECURITY_SETTINGS = {
	biometrics: false,
	payWithBiometrics: false,
	kyc: false,
};

export const securitySettingsAtom = atomWithStorageStorage(
	ATOM_KEYS.SECURITY_SETTINGS,
	DEFAULT_SECURITY_SETTINGS,
);
