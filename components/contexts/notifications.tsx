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
	setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import { handleIncomingCall, handleNotifeeEvent } from "@/lib/utils/call";
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

type Props = {
	children?: React.ReactNode;
};

export const NotificationProvider: React.FC<Props> = ({ children }) => {
	const [token, setToken] = React.useState<string | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	const { user } = useUser();
	const [, updateToken] = useUpdatePushNotificationTokenMutation();
	const router = useRouter();

	React.useEffect(() => {
		const messagingInstance = getMessaging();
		const requestPermissionEffect = async () => {
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
		};

		requestPermissionEffect();

		const unsubscribeForeground = onMessage(
			messagingInstance,
			async (remoteMessage) => {
				const data = remoteMessage.data;
				if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
					router.push({
						pathname: "/chats/[id]/call/voice",
						params: {
							id: String(data.chatId),
							initiate: "false",
						},
					});
				} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
					router.push({
						pathname: "/chats/[id]/call/video",
						params: {
							id: String(data.chatId),
							initiate: "false",
						},
					});
				}
			},
		);

		setBackgroundMessageHandler(messagingInstance, handleIncomingCall);
		notifee.setNotificationCategories([
			{
				id: "incoming-call",
				actions: [
					{
						id: "accept",
						title: "Accept",
						foreground: true,
					},
					{
						id: "reject",
						title: "Reject",
						destructive: true,
					},
				],
			},
		]);

		notifee.getInitialNotification().then((notification) => {
			if (notification) {
				const data = notification.notification.data as any;
				if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
					router.push({
						pathname: "/chats/[id]/call/voice",
						params: {
							id: String(data.chatId),
							initiate: "false",
						},
					});
				} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
					router.push({
						pathname: "/chats/[id]/call/video",
						params: {
							id: String(data.chatId),
							initiate: "false",
						},
					});
				}
			}
		});

		notifee.onBackgroundEvent(handleNotifeeEvent);
		notifee.onForegroundEvent(handleNotifeeEvent);

		return () => {
			unsubscribeForeground();
		};
	}, [user, router, updateToken]);

	return (
		<NotificationContext.Provider value={{ error, token }}>
			{children}
		</NotificationContext.Provider>
	);
};
