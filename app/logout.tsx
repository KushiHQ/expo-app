import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
	DEFAULT_SECURITY_SETTINGS,
	securitySettingsAtom,
} from "@/lib/stores/security-settings";
import { useUserStore } from "@/lib/stores/users";
import { clearAuthTokens } from "@/lib/utils/auth";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";

export default function Logout() {
	const reset = useUserStore((v) => v.reset);
	const setSecuritySettings = useSetAtom(securitySettingsAtom);

	React.useEffect(() => {
		setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
		clearAuthTokens();
		GoogleSignin.signOut();
		reset();
		reset();

		router.replace("/onboarding");
	}, []);

	return null;
}
