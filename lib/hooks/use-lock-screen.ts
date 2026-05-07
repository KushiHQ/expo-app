import { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { usePathname } from "expo-router";
import notifee from "@notifee/react-native";

export const useLockScreen = () => {
	const pathname = usePathname();
	const [isLockScreenLaunch, setIsLockScreenLaunch] = useState(false);

	useEffect(() => {
		if (Platform.OS === "android") {
			notifee.getInitialNotification().then((initial) => {
				if (initial?.pressAction?.id === "full_screen") {
					setIsLockScreenLaunch(true);
				}
			});

			const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
				if (detail.pressAction?.id === "full_screen") {
					setIsLockScreenLaunch(true);
				}
			});

			return unsubscribe;
		}
	}, []);

	useEffect(() => {
		if (isLockScreenLaunch && !pathname.includes("/call/")) {
			BackHandler.exitApp();
		}
	}, [isLockScreenLaunch, pathname]);

	return { isLockScreenLaunch };
};
