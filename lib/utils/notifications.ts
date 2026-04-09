import {
	getMessaging,
	setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import { handleIncomingCall, handleNotifeeEvent } from "@/lib/utils/call";

export function initializeNotifications() {
	const messagingInstance = getMessaging();
	setBackgroundMessageHandler(messagingInstance, handleIncomingCall);

	notifee.onBackgroundEvent(async (event) => {
		await handleNotifeeEvent(event);
	});

	notifee.setNotificationCategories([
		{
			id: "incoming-call",
			actions: [
				{ id: "accept", title: "Accept", foreground: true },
				{ id: "reject", title: "Reject", destructive: true },
			],
		},
	]);
}
