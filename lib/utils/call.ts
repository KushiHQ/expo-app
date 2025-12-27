import { Call, JoinCallData } from "@stream-io/video-react-native-sdk";
import { router } from "expo-router";
import notifee, {
	Event,
	AndroidImportance,
	AndroidCategory,
	EventType,
	AndroidVisibility,
} from "@notifee/react-native";
import { createAudioPlayer } from "expo-audio";
import { CALL_TYPE_VALUE } from "../types/enums/hoting-chat";
import { CallType } from "../services/graphql/generated";

export const joinWithRetry = async (
	call: Call,
	options: JoinCallData = { create: true },
	retries = 3,
) => {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			console.log("OPTS", options);
			await call.join(options);
			return;
		} catch (error: any) {
			if (error?.code === 16 && attempt < retries) {
				await new Promise((res) => setTimeout(res, 300 * attempt));
			} else {
				throw error;
			}
		}
	}
};

const receiverRingtone = require("@/assets/audio/ringtone.mp3");

let ringtonePlayer: ReturnType<typeof createAudioPlayer> | null = null;

export const playRingtone = async () => {
	if (ringtonePlayer) await stopRingtone();

	ringtonePlayer = createAudioPlayer(receiverRingtone);
	ringtonePlayer.loop = true;
	ringtonePlayer.volume = 1.0;
	ringtonePlayer.play();
};

export const stopRingtone = async () => {
	if (ringtonePlayer) {
		ringtonePlayer.pause();
		ringtonePlayer.release();
		ringtonePlayer = null;
	}
};

export const handleIncomingCall = async (remoteMessage: any) => {
	const data = remoteMessage.data;
	if (data?.intent === "voice-call") {
		const channelId = await notifee.createChannel({
			id: "incoming-call",
			name: "Incoming Calls",
			importance: AndroidImportance.HIGH,
			sound: "default",
			vibration: true,
			visibility: AndroidVisibility.PUBLIC,
		});

		await notifee.displayNotification({
			id: data.chatId,
			title: "Incoming Call",
			body: `From ${data.caller}`,
			data,
			android: {
				channelId,
				category: AndroidCategory.CALL,
				importance: AndroidImportance.HIGH,
				visibility: AndroidVisibility.PUBLIC,
				pressAction: { id: "default", launchActivity: "default" },
				fullScreenAction: { id: "full_screen", launchActivity: "default" },
				asForegroundService: true,
				actions: [
					{
						title: "Accept",
						pressAction: { id: "accept", launchActivity: "default" },
					},
					{ title: "Reject", pressAction: { id: "reject" } },
				],
			},
			ios: {
				categoryId: "incoming-call",
				foregroundPresentationOptions: {
					alert: true,
					sound: true,
					badge: true,
				},
				attachments: [],
				sound: "default",
				critical: true,
			},
		});

		await playRingtone();
	}
};

export const handleNotifeeEvent = async ({ type, detail }: Event) => {
	if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
		const { pressAction, notification } = detail;
		const data = notification?.data as any;
		if (pressAction?.id === "accept") {
			await stopRingtone();
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				router.push({
					pathname: "/chats/[id]/call/voice",
					params: {
						id: String(data.chatId),
						initiate: "false",
						accept: "true",
					},
				});
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				router.push({
					pathname: "/chats/[id]/call/video",
					params: {
						id: String(data.chatId),
						initiate: "false",
						accept: "true",
					},
				});
			}
		} else if (pressAction?.id === "default") {
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
		} else if (pressAction?.id === "reject") {
			await stopRingtone();
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				router.push({
					pathname: "/chats/[id]/call/voice",
					params: {
						id: String(data.chatId),
						initiate: "false",
						accept: "false",
					},
				});
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				router.push({
					pathname: "/chats/[id]/call/video",
					params: {
						id: String(data.chatId),
						initiate: "false",
						accept: "false",
					},
				});
			}
		}
		await notifee.cancelNotification(notification?.id ?? "");
	} else if (type === EventType.DISMISSED) {
		const { notification } = detail;
		const data = notification?.data as any;
		await stopRingtone();

		if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
			router.push({
				pathname: "/chats/[id]/call/voice",
				params: {
					id: String(data.chatId),
					initiate: "false",
					accept: "false",
				},
			});
		} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
			router.push({
				pathname: "/chats/[id]/call/video",
				params: {
					id: String(data.chatId),
					initiate: "false",
					accept: "false",
				},
			});
		}
	}
};
