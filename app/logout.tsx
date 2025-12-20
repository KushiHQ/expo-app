import {
	DEFAULT_SECURITY_SETTINGS,
	securitySettingsAtom,
} from "@/lib/stores/security-settings";
import { useUserStore } from "@/lib/stores/users";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";

export default function Logout() {
	const reset = useUserStore((v) => v.reset);
	const setSecuritySettings = useSetAtom(securitySettingsAtom);

	React.useEffect(() => {
		reset();
		setSecuritySettings(DEFAULT_SECURITY_SETTINGS);

		router.replace("/onboarding");
	}, []);

	return null;
}
