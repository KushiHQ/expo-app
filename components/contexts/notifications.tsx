import React from "react";
import {
	CallType,
	useUpdatePushNotificationTokenMutation,
} from "@/lib/services/graphql/generated";
import { useUser } from "@/lib/hooks/user";
import {
	getMessaging,
	getToken,
	onMessage,
	requestPermission,
	AuthorizationStatus,
} from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import { handleNotifeeEvent } from "@/lib/utils/call";
import { useRouter } from "expo-router";
import { CALL_TYPE_VALUE } from "@/lib/types/enums/hoting-chat";

interface NotificationContextType {
	token: string | null;
	error: Error | null;
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

export const NotificationProvider: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = React.useState<string | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	const { user } = useUser();
	const [, updateToken] = useUpdatePushNotificationTokenMutation();
	const router = useRouter();

	const routeToCall = React.useCallback(
		(data: any) => {
			if (!data?.chatId || !data?.intent) return;

			const isVoice = data.intent === CALL_TYPE_VALUE[CallType.Voice];
			const isVideo = data.intent === CALL_TYPE_VALUE[CallType.Video];

			if (isVoice || isVideo) {
				router.push({
					pathname: isVoice
						? "/chats/[id]/call/voice"
						: "/chats/[id]/call/video",
					params: {
						id: String(data.chatId),
						initiate: "false",
					},
				});
			}
		},
		[router],
	);

	React.useEffect(() => {
		const messagingInstance = getMessaging();

		const setupMessaging = async () => {
			try {
				await notifee.requestPermission();
				const authStatus = await requestPermission(messagingInstance);
				const enabled =
					authStatus === AuthorizationStatus.AUTHORIZED ||
					authStatus === AuthorizationStatus.PROVISIONAL;

				if (enabled) {
					const fcmToken = await getToken(messagingInstance);
					if (fcmToken && user.user) {
						updateToken({ input: { fcmToken } });
					}
					setToken(fcmToken);
				} else {
					setError(new Error("Permission denied"));
				}
			} catch (err) {
				console.error("Failed to setup messaging", err);
			}
		};

		setupMessaging();

		const unsubscribeForeground = onMessage(
			messagingInstance,
			async (remoteMessage) => {
				routeToCall(remoteMessage.data);
			},
		);

		notifee.getInitialNotification().then((notification) => {
			if (notification?.notification.data) {
				routeToCall(notification.notification.data);
			}
		});

		const unsubscribeNotifee = notifee.onForegroundEvent(async (event) => {
			await handleNotifeeEvent(event);
		});

		return () => {
			unsubscribeForeground();
			unsubscribeNotifee();
		};
	}, [user.user?.id]);

	return (
		<NotificationContext.Provider value={{ error, token }}>
			{children}
		</NotificationContext.Provider>
	);
};
