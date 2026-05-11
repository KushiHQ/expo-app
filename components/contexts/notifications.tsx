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
import notifee, { EventType } from "@notifee/react-native";
import { handleIncomingCall, handleNotifeeEvent } from "@/lib/utils/call";
import { handleIncomingChatMessage } from "@/lib/utils/notifications";
import { useRouter } from "expo-router";
import { CALL_TYPE_VALUE } from "@/lib/types/enums/hoting-chat";
import { AppState, AppStateStatus } from "react-native";
import { useAudioPlayer } from "expo-audio";
import messaging from "@react-native-firebase/messaging";

interface NotificationContextType {
	token: string | null;
	error: Error | null;
	/** Call from the chat screen to register/deregister itself as active */
	setActiveChatId: (chatId: string | null) => void;
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
	const notificationPlayer = useAudioPlayer(
		require("@/assets/audio/message-notification.mp3"),
	);

	const handledCallId = React.useRef<string | null>(null);
	// Tracks which chat the user is currently viewing (set by the chat screen)
	const currentChatId = React.useRef<string | null>(null);

	const setActiveChatId = React.useCallback((chatId: string | null) => {
		currentChatId.current = chatId;
	}, []);

	const routeToCall = React.useCallback(
		(data: any) => {
			if (!data?.chatId || !data?.intent || !data?.callId) return;

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
						callId: String(data.callId),
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

		const handleAppStateChange = async (nextAppState: AppStateStatus) => {
			if (nextAppState === "active") {
				const notifications = await notifee.getDisplayedNotifications();

				const ringingNotification = notifications.find(
					(n) =>
						n.notification.data?.intent === CALL_TYPE_VALUE[CallType.Voice] ||
						n.notification.data?.intent === CALL_TYPE_VALUE[CallType.Video],
				);

				if (ringingNotification && ringingNotification.notification.data) {
					const data = ringingNotification.notification.data;

					if (handledCallId.current !== data.callId) {
						handledCallId.current = String(data.callId);
						routeToCall(data);
					}
				} else {
					handledCallId.current = null;
				}
			}
		};

		const appStateSub = AppState.addEventListener(
			"change",
			handleAppStateChange,
		);

		handleAppStateChange(AppState.currentState);

		// Handle Notifee notification from a cold start
		notifee.getInitialNotification().then(async (initialNotification) => {
			if (initialNotification) {
				const isAction = initialNotification.pressAction?.id !== "default";

				await handleNotifeeEvent({
					type: isAction ? EventType.ACTION_PRESS : EventType.PRESS,
					detail: initialNotification,
				});
			}
		});

		// Handle tapping an FCM system-tray chat notification from a cold start
		messaging()
			.getInitialNotification()
			.then((remoteMessage) => {
				if (
					remoteMessage?.data?.intent === "notification" &&
					remoteMessage.data?.id
				) {
					router.push(`/chats/${remoteMessage.data.id}` as any);
				}
			});

		// Handle tapping an FCM system-tray chat notification while app is backgrounded
		const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
			(remoteMessage) => {
				if (
					remoteMessage?.data?.intent === "notification" &&
					remoteMessage.data?.id
				) {
					router.push(`/chats/${remoteMessage.data.id}` as any);
				}
			},
		);

		const unsubscribeForeground = onMessage(
			messagingInstance,
			async (remoteMessage) => {
				if (remoteMessage.data?.intent === "cancel_call") {
					await handleIncomingCall(remoteMessage);
					return;
				}

				if (
					remoteMessage.data?.intent === CALL_TYPE_VALUE[CallType.Voice] ||
					remoteMessage.data?.intent === CALL_TYPE_VALUE[CallType.Video]
				) {
					routeToCall(remoteMessage.data);
					return;
				}

				// Chat message: show a Notifee banner unless the user is already in this chat
				const chatId = remoteMessage.data?.id as string | undefined;
				const isViewingThisChat = chatId && currentChatId.current === chatId;

				if (isViewingThisChat) {
					// User is already looking at this chat — play in-chat ping only
					try {
						notificationPlayer.play();
					} catch (err) {
						console.log("Failed to play notification sound", err);
					}
				} else {
					// Show a visible Notifee banner
					try {
						await handleIncomingChatMessage(remoteMessage);
					} catch (err) {
						console.log("Failed to show chat notification banner", err);
					}
				}
			},
		);

		const unsubscribeNotifee = notifee.onForegroundEvent(async (event) => {
			if (event.type === EventType.PRESS || event.type === EventType.ACTION_PRESS) {
				const data = event.detail.notification?.data as any;
				if (data?.intent === "notification" && data?.chatId) {
					router.push(`/chats/${data.chatId}` as any);
					return;
				}
			}
			await handleNotifeeEvent(event);
		});

		return () => {
			appStateSub.remove();
			unsubscribeForeground();
			unsubscribeNotifee();
			unsubscribeOpenedApp();
		};
	}, [user.user?.id]);

	return (
		<NotificationContext.Provider value={{ error, token, setActiveChatId }}>
			{children}
		</NotificationContext.Provider>
	);
};
