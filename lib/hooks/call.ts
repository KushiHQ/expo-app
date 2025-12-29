import {
	callManager,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React from "react";
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
	const { useRemoteParticipants, useLocalParticipant } = useCallStateHooks();
	const [facing, setFacing] = React.useState<CameraType>("front");
	const [isRinging, setIsRinging] = React.useState(true);
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});
	const [cameraEnabled, setCameraEnabled] = React.useState(false);
	const [micEnabled, setMicEnabled] = React.useState(true);
	const { formatted: callDuration } = useCountUp(!isRinging);
	const player = useAudioPlayer(
		initiate === "true" ? callerRingtone : receiverRingtone,
	);
	const [isSpeakerOn, setIsSpeakerOn] = React.useState(isVideoCall);
	const remoteParticipants = useRemoteParticipants();
	const localPaticipant = useLocalParticipant();

	React.useEffect(() => {
		const playRingTone = async () => {
			try {
				player.loop = true;
				player.seekTo(0);
				player.play();
				setIsRinging(true);
			} catch (err) {
				console.log("Error loading ringtone", err);
			}
		};
		playRingTone();
	}, [player]);

	React.useEffect(() => {
		if (call) {
			call.camera.selectDirection(facing);
		}
	}, [facing]);

	React.useEffect(() => {
		if (accept === "true") {
			handleJoin();
		} else if (accept === "false") {
			handleLeave();
		}
	}, [accept]);

	React.useEffect(() => {
		const unsubscribe = call?.on("call.session_participant_joined", (p) => {
			if (p.participant.user.id !== user.user?.id) {
				stopRingtone();
				setIsRinging(false);
			}
		});
		const unsubscribeAccepted = call?.on("call.accepted", () => {
			stopRingtone();
			setIsRinging(false);
		});
		const unsubscribeCallEnd = call?.on(
			"call.session_participant_left",
			(p) => {
				if (p.participant.user.id !== user.user?.id) {
					call.endCall();
					router.back();
				}
			},
		);

		callManager.speaker.setForceSpeakerphoneOn(isSpeakerOn);

		return () => {
			unsubscribe?.();
			unsubscribeAccepted?.();
			unsubscribeCallEnd?.();
		};
	}, [call]);

	React.useEffect(() => {
		if (call) {
			callManager.speaker.setForceSpeakerphoneOn(isSpeakerOn);
		}
	}, [isSpeakerOn]);

	React.useEffect(() => {
		if (call) {
			if (!micEnabled) {
				call.microphone.disable();
			} else {
				call.microphone.enable();
			}
		}
	}, [call, micEnabled]);

	const stopRingtone = async () => {
		try {
			if (player) {
				player.pause();
			}
		} catch {}
		setIsRinging(false);
	};

	function handleLeave() {
		stopRingtone();
		try {
			if (initiate === "true") {
				call?.leave();
			} else {
				call?.reject();
			}
		} catch {}
		router.replace(`/chats/${id}`);
	}

	async function handleJoin() {
		stopRingtone();
		try {
			if (call) {
				joinWithRetry(call, {
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
					setCameraEnabled(true);
				}
			}
		} catch (e) {
			console.error("Join failed", e);
		}
	}

	function toggleSpeakerOn() {
		setIsSpeakerOn((c) => !c);
	}

	function toggleFacingCamera() {
		setFacing((c) => {
			if (c === "front") {
				return "back";
			} else {
				return "front";
			}
		});
	}

	function toggleCamera() {
		if (call) {
			if (!cameraEnabled) {
				call.camera.enable();
				setCameraEnabled(true);
			} else {
				call.camera.disable();
				setCameraEnabled(false);
			}
		}
	}

	function toggleMic() {
		setMicEnabled((c) => !c);
	}

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
		localPaticipant,
		toggleFacingCamera,
		setFacing,
		toggleCamera,
		cameraEnabled,
		micEnabled,
		toggleMic,
	};
};
