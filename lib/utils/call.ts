import * as Crypto from "expo-crypto";
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
import { Href } from "expo-router";

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
	console.log(data);
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
		console.log("Recieved Cancel", data);
		await stopRingtone();
		await notifee.cancelNotification(data.chatId);
		await notifee.stopForegroundService();
	}
};

export const handleNotifeeEvent = async ({ type, detail }: Event) => {
	if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
		const { pressAction, notification } = detail;
		const data = notification?.data as any;

		// Chat message notification tap — route to the chat
		if (data?.intent === "notification" && data?.chatId) {
			await Linking.openURL(`kushi://chats/${data.chatId}`);
			return;
		}

		if (pressAction?.id === "full_screen") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&callId=${data.callId}`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&callId=${data.callId}`,
				);
			}
			return;
		}

		await stopRingtone();

		if (pressAction?.id === "accept") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&accept=true&callId=${data.callId}`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&accept=true&callId=${data.callId}`,
				);
			}
		} else if (pressAction?.id === "default") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&callId=${data.callId}`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&callId=${data.callId}`,
				);
			}
		} else if (pressAction?.id === "reject") {
			if (data?.intent === CALL_TYPE_VALUE[CallType.Voice]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/voice?initiate=false&accept=false&callId=${data.callId}`,
				);
			} else if (data?.intent === CALL_TYPE_VALUE[CallType.Video]) {
				await Linking.openURL(
					`kushi://chats/${data.chatId}/call/video?initiate=false&accept=false&callId=${data.callId}`,
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

export function buildCallURL(
	chatId: string,
	callType: "voice" | "video",
	initiate = false,
) {
	let url: Href = `/chats/${chatId}/call/${callType}`;
	const uniqueCallId = Crypto.randomUUID();
	if (initiate) {
		url = `${url}?initiate=true&callId=${uniqueCallId}`;
	}

	return url;
}
