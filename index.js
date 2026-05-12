import "expo-router/entry";
import messaging from "@react-native-firebase/messaging";
import RNCallKeep from "react-native-callkeep";
import VoipPushNotification from "react-native-voip-push-notification";
import { Platform } from "react-native";
import { handleIncomingCall } from "./lib/utils/call";
import { EventEmitter } from "./lib/utils/event-emitter";

// Keyed by callId so answerCall/endCall events can look up the full call data
const pendingCalls = {};

if (Platform.OS === "ios") {
	RNCallKeep.setup({
		ios: {
			appName: "Kushi",
			includesCallsInRecents: false,
		},
	});
	RNCallKeep.setAvailable(true);

	// Called when a VoIP push arrives (app alive or woken from killed state)
	VoipPushNotification.addEventListener("notification", (notification) => {
		const { callId, chatId, intent, caller } = notification;
		if (!callId) return;

		pendingCalls[callId] = { callId, chatId, intent, caller };

		RNCallKeep.displayIncomingCall(
			callId,
			caller || "Incoming Call",
			caller || "Incoming Call",
			"generic",
			intent === "video-call",
		);
	});

	// Fired on first mount with any events that were queued while the app was killed
	VoipPushNotification.addEventListener("didLoadWithEvents", (events) => {
		if (!events || !events.length) return;
		for (const event of events) {
			if (event.name === "RNVoipPushRemoteNotificationsRegisteredEvent") {
				EventEmitter.emit("voip_token", event.data);
			} else if (
				event.name === "RNVoipPushRemoteNotificationReceivedEvent"
			) {
				const { callId, chatId, intent, caller } = event.data;
				if (!callId) continue;
				pendingCalls[callId] = { callId, chatId, intent, caller };
				RNCallKeep.displayIncomingCall(
					callId,
					caller || "Incoming Call",
					caller || "Incoming Call",
					"generic",
					intent === "video-call",
				);
			}
		}
	});

	// PushKit token — emitted so NotificationProvider can send it to the backend
	VoipPushNotification.addEventListener("register", (token) => {
		EventEmitter.emit("voip_token", token);
	});

	VoipPushNotification.registerVoipToken();

	// User answered the call from the native CallKit UI
	RNCallKeep.addEventListener("answerCall", ({ callUUID }) => {
		const callData = pendingCalls[callUUID];
		if (callData) {
			EventEmitter.emit("callkeep_answer", callData);
			delete pendingCalls[callUUID];
		}
		RNCallKeep.endCall(callUUID);
	});

	// User declined / ended the call from the native CallKit UI
	RNCallKeep.addEventListener("endCall", ({ callUUID }) => {
		const callData = pendingCalls[callUUID];
		if (callData) {
			EventEmitter.emit("callkeep_end", callData);
			delete pendingCalls[callUUID];
		}
	});
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	const data = remoteMessage.data;

	if (Platform.OS === "ios") {
		// VoIP pushes are handled by PushKit above — FCM background messages on iOS
		// are only used as a fallback for devices that haven't registered a VoIP token yet
		if (data?.intent === "voice-call" || data?.intent === "video-call") {
			const callUUID = data.callId;
			const callerName = data.caller || "Incoming Call";
			const hasVideo = data.intent === "video-call";

			pendingCalls[callUUID] = {
				callId: data.callId,
				chatId: data.chatId,
				intent: data.intent,
				caller: data.caller,
			};

			RNCallKeep.displayIncomingCall(
				callUUID,
				callerName,
				callerName,
				"generic",
				hasVideo,
			);
		}

		if (data?.intent === "cancel_call") {
			if (data.callId) {
				RNCallKeep.endCall(data.callId);
			} else {
				RNCallKeep.endAllCalls();
			}
		}
	} else {
		await handleIncomingCall(remoteMessage);
	}
});
