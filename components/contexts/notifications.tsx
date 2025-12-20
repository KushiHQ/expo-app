import React from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/lib/utils/notifications";
import { useRouter } from "expo-router";
import { useUpdatePushNotificationTokenMutation } from "@/lib/services/graphql/generated";
import { useUser } from "@/lib/hooks/user";

interface NotificationContextType {
	token: string | null;
	error: Error | null;
	notification: Notifications.Notification | null;
}

const NotificationContext = React.createContext<
	NotificationContextType | undefined
>(undefined);

export const useNotifications = () => {
	const context = React.useContext(NotificationContext);

	if (!context) {
		throw new Error(
			"useNotifications must be used within NotificationProvider",
		);
	}
	return context;
};

type Props = {
	children?: React.ReactNode;
};

export const NotificationProvider: React.FC<Props> = ({ children }) => {
	const router = useRouter();
	const [token, setToken] = React.useState<string | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	const [notification, setNotification] =
		React.useState<Notifications.Notification | null>(null);
	const notificationListener = React.useRef<EventSubscription>(null);
	const responseListener = React.useRef<EventSubscription>(null);
	const { user } = useUser();
	const [_, updateToken] = useUpdatePushNotificationTokenMutation();

	React.useEffect(() => {
		registerForPushNotificationsAsync()
			.then((token) => {
				if (
					user.user &&
					user.user.notificationSettings.token !== token &&
					token
				) {
					updateToken({
						expoToken: token,
					});
				}
				setToken(token ?? null);
			})
			.catch((err) => setError(err ?? null));

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log("Notifications Recieved", notification);
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				const actionId = response.actionIdentifier;
				const data = response.notification.request.content.data;

				if (data.intent === "voice-call") {
					if (actionId === "answer") {
						router.push(`/chats/${data.chatId}/voice?answer=true`);
					} else if (actionId === "decline") {
						console.log("Declined");
					} else if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
						router.push(`/chats/${data.chatId}/voice?initiate=false`);
					}
				}

				console.log(
					"Notification Response",
					JSON.stringify(response, null, 2),
					JSON.stringify(response.notification.request.content.data, null, 2),
				);
			});

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove();
			}
			if (responseListener.current) {
				responseListener.current.remove();
			}
		};
	}, [user]);

	return (
		<NotificationContext.Provider value={{ error, token, notification }}>
			{children}
		</NotificationContext.Provider>
	);
};
