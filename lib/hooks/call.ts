import {
	callManager,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useUser } from "./user";
import { useHostingChatQuery } from "../services/graphql/generated";
import { cast } from "../types/utils";
import { useCountUp } from "./use-countup";
import { useAudioPlayer } from "expo-audio";
import { joinWithRetry } from "../utils/call";
import { CameraType } from "expo-camera";

const callerRingtone = require("@/assets/audio/caller-ringtone.mp3");
const receiverRingtone = require("@/assets/audio/ringtone.mp3");

export const useActiveCall = () => {
	const router = useRouter();
	const pathname = usePathname();
	const isVideoCall = pathname.endsWith("video");
	const { id, initiate, accept } = useLocalSearchParams();
	const { user } = useUser();
	const call = useCall();

	const {
		useRemoteParticipants,
		useLocalParticipant,
		useMicrophoneState,
		useCameraState,
	} = useCallStateHooks();

	const remoteParticipants = useRemoteParticipants();
	const localParticipant = useLocalParticipant();
	const { status: micStatus } = useMicrophoneState();
	const { status: cameraStatus } = useCameraState();

	const [facing, setFacing] = React.useState<CameraType>("front");
	const [isRinging, setIsRinging] = React.useState(true);
	const [isSpeakerOn, setIsSpeakerOn] = React.useState(isVideoCall);

	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});

	const recipientId = chatData?.hostingChat.recipientUser?.id;

	const { formatted: callDuration } = useCountUp(!isRinging);

	const player = useAudioPlayer(
		initiate === "true" ? callerRingtone : receiverRingtone,
	);

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		if (initiate === "true" && isRinging) {
			timeoutId = setTimeout(() => {
				handleLeave();
			}, 45000);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [initiate, isRinging]);

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
			} catch (e) {}
		};
	}, [player, isRinging]);

	useEffect(() => {
		if (!call) return;

		const handleParticipantJoined = (event: any) => {
			if (event.participant.user.id !== user.user?.id) {
				setIsRinging(false);
			}
		};

		const handleCallAccepted = () => setIsRinging(false);

		const handleParticipantLeft = (event: any) => {
			if (event.participant.user.id !== user.user?.id) {
				call.endCall();
				router.back();
			}
		};

		const handleCallRejected = () => {
			setIsRinging(false);
			call.endCall();
			router.replace(`/chats/${id}`);
		};

		const handleCallEnded = () => {
			setIsRinging(false);
			router.replace(`/chats/${id}`);
		};

		const unsubscribeJoined = call.on(
			"call.session_participant_joined",
			handleParticipantJoined,
		);
		const unsubscribeAccepted = call.on("call.accepted", handleCallAccepted);
		const unsubscribeLeft = call.on(
			"call.session_participant_left",
			handleParticipantLeft,
		);
		const unsubscribeRejected = call.on("call.rejected", handleCallRejected);
		const unsubscribeEnded = call.on("call.ended", handleCallEnded);

		return () => {
			unsubscribeJoined();
			unsubscribeAccepted();
			unsubscribeLeft();
			unsubscribeRejected();
			unsubscribeEnded();
		};
	}, [call, user.user?.id, router]);

	useEffect(() => {
		call?.camera.selectDirection(facing);
	}, [facing, call]);

	useEffect(() => {
		callManager.speaker.setForceSpeakerphoneOn(isSpeakerOn);
	}, [isSpeakerOn]);

	const actionHandled = useRef(false);

	useEffect(() => {
		if (!call || actionHandled.current) return;

		const setupCall = async () => {
			try {
				if (initiate === "true") {
					if (!recipientId || !user.user?.id) return;

					actionHandled.current = true;

					await call.getOrCreate({
						ring: true,
						data: {
							members: [{ user_id: user.user.id }, { user_id: recipientId }],
						},
					});

					await handleJoin();
				} else if (accept === "true") {
					actionHandled.current = true;
					await handleJoin();
				} else if (accept === "false") {
					actionHandled.current = true;
					await handleLeave();
				}
			} catch (error) {
				console.error("Failed to setup call:", error);
				handleLeave();
			}
		};

		setupCall();
	}, [call, initiate, accept, recipientId, user.user?.id]);

	const handleLeave = async () => {
		try {
			player.pause();
		} catch (e) {}

		try {
			if (initiate === "true" && isRinging) {
				await call?.endCall();
			} else {
				await call?.reject();
			}
		} catch (e: any) {
			if (
				e?.message?.includes("AddIceCandidate") ||
				e?.message?.includes("shut down")
			) {
				console.info("Gracefully ignored background WebRTC cleanup.");
			} else {
				console.warn("Error leaving call", e);
			}
		}

		router.replace(`/chats/${id}`);
	};

	const handleJoin = async () => {
		if (initiate !== "true") {
			setIsRinging(false);
		}

		try {
			if (call) {
				const callingState = call.state.callingState;
				if (callingState === "joining" || callingState === "joined") {
					return;
				}

				await joinWithRetry(call, {
					video: isVideoCall,
					data: {
						settings_override: {
							video: {
								camera_default_on: isVideoCall,
								target_resolution: {
									bitrate: 400000,
									height: 640,
									width: 360,
								},
							},
						},
					},
				});

				if (isVideoCall) {
					await call.camera.enable();
				}
			}
		} catch (e) {
			console.error("Join failed", e);
		}
	};

	const toggleCamera = async () => {
		if (!call) return;
		if (cameraStatus === "enabled") {
			await call.camera.disable();
		} else {
			await call.camera.enable();
		}
	};

	const toggleMic = async () => {
		if (!call) return;
		if (micStatus === "enabled") {
			await call.microphone.disable();
		} else {
			await call.microphone.enable();
		}
	};

	const toggleSpeakerOn = () => setIsSpeakerOn((c) => !c);
	const toggleFacingCamera = () =>
		setFacing((c) => (c === "front" ? "back" : "front"));

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
		remoteParticipant: remoteParticipants.at(0),
		localParticipant,
		toggleFacingCamera,
		setFacing,
		toggleCamera,
		cameraEnabled: cameraStatus === "enabled",
		micEnabled: micStatus === "enabled",
		toggleMic,
	};
};
