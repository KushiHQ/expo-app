import {
	DEFAULT_NOTIFICATION_SETTINGS,
	notificationSettingsAtom,
} from "@/lib/stores/notification-settings";
import {
	DEFAULT_SECURITY_SETTINGS,
	securitySettingsAtom,
} from "@/lib/stores/security-settings";
import { DEFAULT_USER, userAtom } from "@/lib/stores/users";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";

export default function Logout() {
	const setUser = useSetAtom(userAtom);
	const setNotificationSettings = useSetAtom(notificationSettingsAtom);
	const setSecuritySettings = useSetAtom(securitySettingsAtom);

	React.useEffect(() => {
		setUser(DEFAULT_USER);
		setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
		setSecuritySettings(DEFAULT_SECURITY_SETTINGS);

		router.replace("/onboarding");
	}, []);

	return null;
}
