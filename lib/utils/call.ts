import { Call, JoinCallData } from "@stream-io/video-react-native-sdk";
import * as Linking from "expo-linking";
import notifee, {
	Event,
	AndroidImportance,
	AndroidCategory,
	EventType,
	AndroidVisibility,
	AndroidForegroundServiceType,
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
	if (data?.intent === "voice-call" || data?.intent === "video-call") {
		const channelId = await notifee.createChannel({
			id: "incoming-call-v3",
			name: "Incoming Calls",
			importance: AndroidImportance.HIGH,
			vibration: true,
			visibility: AndroidVisibility.PUBLIC,
		});

		await notifee.displayNotification({
			id: data.chatId,
			title:
				data?.intent === "voice-call"
					? "Incoming Voice Call"
					: "Incoming Video Call",
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
				foregroundServiceTypes: [
					AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING,
				],
				color: "#266DD3",
				actions: [
					{
						title: "<b>Accept</b>",
						pressAction: { id: "accept", launchActivity: "default" },
					},
					{
						title: '<font color="#D32F2F"><b>Decline</b></font>',
						pressAction: { id: "reject" },
					},
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
				sound: "ringtone.mp3",
				critical: true,
			},
		});

		await playRingtone();
	} else if (data?.intent === "cancel_call") {
		console.log(data);
		await stopRingtone();
		await notifee.cancelNotification(data.chatId);
		await notifee.stopForegroundService();
	}
};

export const handleNotifeeEvent = async ({ type, detail }: Event) => {
	if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
		const { pressAction, notification } = detail;
		const data = notification?.data as any;

		await stopRingtone();

		if (pressAction?.id === "accept") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&accept=true`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&accept=true`,
				);
			}
		} else if (pressAction?.id === "default") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false`,
				);
			}
		} else if (pressAction?.id === "reject") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&accept=false`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&accept=false`,
				);
			}
		}

		await notifee.stopForegroundService();
		await notifee.cancelNotification(notification?.id ?? "");
	} else if (type === EventType.DISMISSED) {
		await stopRingtone();
		await notifee.stopForegroundService();
	}
};
