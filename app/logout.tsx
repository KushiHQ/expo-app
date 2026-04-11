import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
	DEFAULT_SECURITY_SETTINGS,
	useSecuritySettingsStore,
} from "@/lib/stores/security-settings";
import { useUserStore } from "@/lib/stores/users";
import { clearAuthTokens } from "@/lib/utils/auth";
import { router } from "expo-router";
import React from "react";

export default function Logout() {
	const reset = useUserStore((v) => v.reset);
	const setSecuritySettings = useSecuritySettingsStore(
		(state) => state.setSecuritySettings,
	);

	React.useEffect(() => {
		setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
		reset();
		clearAuthTokens();
		GoogleSignin.signOut();

		router.replace("/onboarding");
	}, [setSecuritySettings, reset]);

	return null;
}
