import React from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/lib/utils/registerForPushNotificationsAsync";

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
	const [token, setToken] = React.useState<string | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	const [notification, setNotification] =
		React.useState<Notifications.Notification | null>(null);
	const notificationListener = React.useRef<EventSubscription>(null);
	const responseListener = React.useRef<EventSubscription>(null);

	React.useEffect(() => {
		registerForPushNotificationsAsync()
			.then((token) => setToken(token ?? null))
			.catch((err) => setError(err ?? null));

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log("Notifications Recieved", notification);
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
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
	}, []);

	return (
		<NotificationContext.Provider value={{ error, token, notification }}>
			{children}
		</NotificationContext.Provider>
	);
};
