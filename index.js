import "expo-router/entry";
import messaging from "@react-native-firebase/messaging";
import RNCallKeep from "react-native-callkeep";
import { Platform } from "react-native";
import { handleIncomingCall } from "./lib/utils/call";

if (Platform.OS === "ios") {
	RNCallKeep.setup({
		ios: {
			appName: "Kushi",
			includesCallsInRecents: false,
		},
	});
	RNCallKeep.setAvailable(true);
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	const data = remoteMessage.data;

	if (Platform.OS === "ios") {
		if (data?.intent === "voice-call" || data?.intent === "video-call") {
			const callUUID = data.callId;
			const callerName = data.caller || "Incoming Call";
			const hasVideo = data.intent === "video-call";

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
