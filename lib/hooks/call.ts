import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useCallback } from "react";
import {
	CallType,
	useHostingChatQuery,
	useSendChatCallNotificationMutation,
} from "../services/graphql/generated";
import { cast } from "../types/utils";
import { useCountUp } from "./use-countup";
import { useAudioPlayer } from "expo-audio";
import Daily from "@daily-co/react-native-daily-js";
import { useCallStore } from "../stores/call";

const callerRingtone = require("@/assets/audio/caller-ringtone.mp3");
const receiverRingtone = require("@/assets/audio/ringtone.mp3");

export const useActiveCall = () => {
	const router = useRouter();
	const pathname = usePathname();
	const isVideoCall = pathname.endsWith("video");
	const { id, initiate, accept, callId: routeCallId } = useLocalSearchParams();

	const {
		call,
		setCall,
		localParticipant,
		remoteParticipant,
		setParticipants,
		isRinging,
		setIsRinging,
		cameraEnabled,
		setCameraEnabled,
		micEnabled,
		setMicEnabled,
		isSpeakerOn,
		setIsSpeakerOn,
		isJoining,
		setIsJoining,
		networkState,
		setNetworkState,
		resetCallState,
	} = useCallStore();

	const [, sendNotification] = useSendChatCallNotificationMutation();

	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});

	const { formatted: callDuration } = useCountUp(!isRinging);

	const player = useAudioPlayer(
		initiate === "true" ? callerRingtone : receiverRingtone,
	);

	// 1. INITIALIZE DAILY CALL OBJECT (Global Persistence)
	useEffect(() => {
		if (!call) {
			const newCall = Daily.createCallObject();
			setCall(newCall);
		}
	}, [call, setCall]);

	// Timeout for un-answered calls
	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;
		if (initiate === "true" && isRinging) {
			timeoutId = setTimeout(() => {
				sendNotification({
					chatId: cast(id),
					callId: String(routeCallId),
					callType: CallType.Cancel,
				}).catch((err) =>
					console.error("Failed to send timeout cancel push", err),
				);

				handleLeave();
			}, 45000);
		}
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [initiate, isRinging, id, routeCallId, sendNotification]);

	// 3. RINGTONE AUDIO
	useEffect(() => {
		const startRinging = async () => {
			try {
				if (isRinging) {
					player.loop = true;
					player.seekTo(0);
					player.play();
				} else {
					player.pause();
				}
			} catch (err) {
				console.error("Error loading ringtone", err);
			}
		};
		startRinging();

		return () => {
			try {
				player.pause();
			} catch (e) { }
		};
	}, [player, isRinging]);

	// Initial Audio Routing (Item 2)
	useEffect(() => {
		if (call && !isJoining) {
			const initialDevice = isVideoCall ? "SPEAKERPHONE" : "EARPIECE";
			call.setAudioDevice(initialDevice).catch((e) =>
				console.warn("Failed to set initial audio device:", e)
			);
			setIsSpeakerOn(isVideoCall);

			// Item 7: Bandwidth Optimization
			// Cap upstream bandwidth to save data and battery on mobile
			// 1000 kbps for video, 100 kbps for voice
			const kbs = isVideoCall ? 1000 : 100;
			call.setBandwidth({ kbs }).catch((e) =>
				console.warn("Failed to set bandwidth cap:", e)
			);
		}
	}, [call, isVideoCall, isJoining, setIsSpeakerOn]);

	useEffect(() => {
		if (!call) return;

		const updateParticipants = () => {
			const p = call.participants();
			const remoteIds = Object.keys(p).filter((pid) => pid !== "local");
			const remote = remoteIds.length > 0 ? p[remoteIds[0]] : null;

			setParticipants(p.local, remote);

			if (remote && isRinging) {
				setIsRinging(false);
			}
		};

		const handleLeft = () => {
			setIsRinging(false);
			resetCallState();
			router.replace(`/chats/${id}`);
		};

		const handleNetworkChange = (ev: { event: string; connection: string }) => {
			setNetworkState(ev.connection);
		};

		call.on("joined-meeting", updateParticipants);
		call.on("participant-joined", updateParticipants);
		call.on("participant-updated", updateParticipants);

		call.on("participant-left", handleLeft);
		call.on("left-meeting", handleLeft);
		call.on("error", handleLeft);

		call.on("network-connection", handleNetworkChange);

		return () => {
			call.off("joined-meeting", updateParticipants);
			call.off("participant-joined", updateParticipants);
			call.off("participant-updated", updateParticipants);
			call.off("participant-left", handleLeft);
			call.off("left-meeting", handleLeft);
			call.off("error", handleLeft);
			call.off("network-connection", handleNetworkChange);
		};
	}, [call, id, router, isRinging, setParticipants, setIsRinging, resetCallState, setNetworkState]);

	const actionHandled = useRef(false);
	useEffect(() => {
		if (!call || actionHandled.current) return;

		const setupCall = async () => {
			const state = call.meetingState();
			if (state === "joined-meeting" || state === "joining-meeting") {
				actionHandled.current = true;
				return;
			}

			try {
				// Item 3: Permissions pre-flight
				await call.requestAccess();

				if (initiate === "true") {
					actionHandled.current = true;
					setCameraEnabled(isVideoCall);

					await sendNotification({
						chatId: cast(id),
						callId: String(routeCallId),
						callType: isVideoCall ? CallType.Video : CallType.Voice,
					});

					await handleJoin();
				} else if (accept === "true") {
					actionHandled.current = true;
					setCameraEnabled(isVideoCall);
					await handleJoin();
				} else if (accept === "false") {
					actionHandled.current = true;
					await handleLeave();
				} else {
					if (isVideoCall) {
						await call.startCamera();
					}
				}
			} catch (error) {
				console.error("Failed to setup call:", error);
				handleLeave();
			}
		};

		setupCall();
	}, [call, initiate, accept, isVideoCall]);

	const handleLeave = useCallback(async () => {
		try {
			player.pause();
		} catch (e) { }

		// Item 8: If caller leaves while still ringing, send a cancellation
		if (initiate === "true" && isRinging) {
			sendNotification({
				chatId: cast(id),
				callId: String(routeCallId),
				callType: CallType.Cancel,
			}).catch((err) =>
				console.error("Failed to send manual cancel push", err),
			);
		}

		try {
			if (call) {
				await call.leave();
			}
		} catch (e) {
			console.warn("Error leaving call", e);
		}
		// Reset state and navigate
		resetCallState();
		router.replace(`/chats/${id}`);
	}, [call, id, player, router, resetCallState, initiate, isRinging, routeCallId, sendNotification]);

	const handleJoin = useCallback(async () => {
		try {
			if (!call || isJoining) return;

			setIsJoining(true);

			const domain = process.env.EXPO_PUBLIC_DAILY_DOMAIN;
			if (!domain) {
				throw new Error("Missing EXPO_PUBLIC_DAILY_DOMAIN in .env");
			}
			if (!routeCallId) {
				throw new Error("Missing callId in route parameters");
			}
			const roomUrl = `https://${domain}/${routeCallId}`;

			await call.join({
				url: roomUrl,
				videoSource: isVideoCall,
				audioSource: true,
			});

			if (initiate !== "true") {
				setIsRinging(false);
			}
		} catch (e) {
			console.error("Join failed", e);
		} finally {
			setIsJoining(false);
		}
	}, [call, isVideoCall, initiate, routeCallId, isJoining, setIsJoining, setIsRinging]);

	const toggleCamera = useCallback(() => {
		if (!call) return;
		const newState = !cameraEnabled;
		call.setLocalVideo(newState);
		setCameraEnabled(newState);
	}, [call, cameraEnabled, setCameraEnabled]);

	const toggleMic = useCallback(() => {
		if (!call) return;
		const newState = !micEnabled;
		call.setLocalAudio(newState);
		setMicEnabled(newState);
	}, [call, micEnabled, setMicEnabled]);

	const toggleFacingCamera = useCallback(async () => {
		if (!call) return;

		try {
			await call.cycleCamera();
		} catch (e) {
			console.error("Failed to flip camera:", e);
		}
	}, [call]);

	const toggleSpeakerOn = useCallback(async () => {
		if (!call) return;
		const newState = !isSpeakerOn;
		try {
			await call.setAudioDevice(newState ? "SPEAKERPHONE" : "EARPIECE");
			setIsSpeakerOn(newState);
		} catch (e) {
			console.error("Failed to toggle speaker:", e);
		}
	}, [call, isSpeakerOn, setIsSpeakerOn]);

	return {
		call,
		callDuration,
		isCaller: initiate === "true",
		recipient: chatData?.hostingChat.recipientUser,
		leaveCall: handleLeave,
		joinCall: handleJoin,
		isRinging,
		isSpeakerOn,
		toggleSpeakerOn,
		remoteParticipant,
		localParticipant,
		toggleFacingCamera,
		toggleCamera,
		cameraEnabled,
		micEnabled,
		toggleMic,
		networkState,
	};
};
