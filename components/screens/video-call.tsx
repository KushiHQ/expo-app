import { RTCView } from "@stream-io/react-native-webrtc";
import ThemedText from "@/components/atoms/a-themed-text";
import {
	F7PhoneDownFill,
	Fa7SolidPhone,
	HeroiconsPhoneXMark,
} from "@/components/icons/i-phone";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Mic, MicOff } from "lucide-react-native";
import React from "react";
import DetailsLayout from "@/components/layouts/details";
import { useActiveCall } from "@/lib/hooks/call";
import { cast } from "@/lib/types/utils";
import { GravityUiArrowsRotateRight } from "../icons/i-rotate";
import CallParticipantProfile from "../molecules/m-call-participant-profile";
import { useRouter } from "expo-router";
import { VideoRenderer } from "@stream-io/video-react-native-sdk";

type Props = {
	callData?: ReturnType<typeof useActiveCall>;
};

const ChatVideoCallScreen: React.FC<Props> = ({ callData }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [hasRenderedRemoteStream, setHasRenderedRemoteStream] =
		React.useState(false);

	const myStream = callData?.localPaticipant?.videoStream;
	const remoteStream = callData?.remoteParticipant?.videoStream;

	const activeStream =
		callData?.isRinging || callData?.isRinging === undefined
			? myStream
			: remoteStream;

	React.useEffect(() => {
		let timeout: number;
		if (!callData?.cameraEnabled) {
			callData?.toggleCamera();
			timeout = setTimeout(() => {
				callData?.setFacing("front");
			}, 500);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [callData?.cameraEnabled]);

	React.useEffect(() => {
		let timeout: number;
		if (callData?.remoteParticipant?.videoStream) {
			timeout = setTimeout(() => setHasRenderedRemoteStream(true), 1000);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [callData?.remoteParticipant?.videoStream]);

	return (
		<View style={styles.container}>
			{callData?.remoteParticipant ? (
				<VideoRenderer participant={callData.remoteParticipant} />
			) : (
				activeStream && (
					<RTCView
						style={{ position: "absolute", inset: 0 }}
						streamURL={cast<any>(activeStream)?.toURL?.()}
						mirror={callData?.isRinging}
						objectFit="cover"
					/>
				)
			)}
			<View className="absolute inset-0">
				<DetailsLayout
					title={
						callData?.isRinging || !callData
							? !callData || callData?.isCaller
								? "Calling..."
								: "Incoming Call"
							: callData.recipient?.profile.fullName
					}
					backButton="solid"
					background="transparent"
				>
					<View className="flex-1">
						{(!callData || callData?.isRinging) && (
							<View className="absolute self-center mt-32">
								<CallParticipantProfile callData={callData} />
							</View>
						)}
						{callData && !callData?.isRinging && (
							<View
								style={[
									styles.pipContainer,
									{
										borderColor: hexToRgba(colors.text, 0.6),
										...Platform.select({
											ios: {
												shadowColor: colors.primary,
												shadowOffset: { width: 0, height: -2 },
												shadowOpacity: 0.1,
												shadowRadius: 8,
											},
											android: {
												elevation: 8,
												shadowColor: hexToRgba(colors.primary, 0.3),
											},
										}),
									},
								]}
							>
								{callData.localPaticipant && hasRenderedRemoteStream ? (
									<>
										<RTCView
											streamURL={cast<any>(
												callData?.call?.camera.state.mediaStream,
											)?.toURL?.()}
											style={{
												height: "100%",
												width: "100%",
												borderRadius: 16,
												backgroundColor: "black",
											}}
											mirror={
												callData?.call?.camera.state.direction === "front"
											}
											objectFit="cover"
										/>
										{console.log("Rendering LocalStream")}
									</>
								) : (
									<RTCView
										streamURL={cast<any>(
											callData?.call?.camera.state.mediaStream,
										)?.toURL?.()}
										style={{
											height: "100%",
											width: "100%",
											borderRadius: 16,
											backgroundColor: "black",
										}}
										mirror={callData?.call?.camera.state.direction === "front"}
										objectFit="cover"
									/>
								)}
							</View>
						)}

						{/* Bottom Controls */}
						<View style={styles.controlsContainer} className="gap-4">
							{!callData?.isRinging && (
								<ThemedText className="text-center">
									{callData?.callDuration}
								</ThemedText>
							)}
							{!callData?.isCaller && callData?.isRinging ? (
								<View className="flex-row items-center justify-center gap-10 p-6">
									<View className="items-center gap-2 mr-8">
										<Pressable
											onPress={callData?.leaveCall}
											className="w-20 h-20 rounded-full items-center justify-center"
											style={{ backgroundColor: colors.error }}
										>
											<F7PhoneDownFill
												size={37}
												color={colors["shade-content"]}
											/>
										</Pressable>
										<ThemedText>Decline</ThemedText>
									</View>
									<View className="items-center gap-2 ml-8">
										<Pressable
											className="w-20 h-20 rounded-full items-center justify-center"
											onPress={callData?.joinCall}
											style={{ backgroundColor: colors.success }}
										>
											<Fa7SolidPhone
												size={37}
												color={colors["shade-content"]}
											/>
										</Pressable>
										<ThemedText>Answer</ThemedText>
									</View>
								</View>
							) : (
								<View>
									<View
										className="p-8 rounded-xl border"
										style={[
											styles.controls,
											{
												backgroundColor: hexToRgba("#000000", 0.9),
												borderColor: hexToRgba("#ffffff", 0.1),
											},
										]}
									>
										<Pressable
											onPress={() => callData?.toggleSpeakerOn()}
											style={[
												styles.controlButton,
												{
													backgroundColor: callData?.isSpeakerOn
														? "white"
														: colors.shade,
												},
											]}
										>
											<QlementineIconsSpeaker16
												size={28}
												color={
													callData?.isSpeakerOn
														? "black"
														: colors["shade-content"]
												}
											/>
										</Pressable>

										<Pressable
											onPress={() => callData?.toggleMic()}
											style={[
												styles.controlButton,
												{
													backgroundColor: !callData?.micEnabled
														? "white"
														: colors.shade,
												},
											]}
										>
											{!callData?.micEnabled ? (
												<MicOff size={28} color="black" />
											) : (
												<Mic size={28} color="white" />
											)}
										</Pressable>

										<Pressable
											onPress={() => callData?.toggleFacingCamera()}
											style={[
												styles.controlButton,
												{ backgroundColor: colors.shade },
											]}
										>
											<GravityUiArrowsRotateRight size={28} color="white" />
										</Pressable>

										<Pressable
											onPress={() => {
												if (callData) {
													callData?.leaveCall();
												} else {
													router.back();
												}
											}}
											style={[
												styles.controlButton,
												{ backgroundColor: colors.error },
											]}
										>
											<HeroiconsPhoneXMark size={28} color="white" />
										</Pressable>
									</View>
								</View>
							)}
						</View>
					</View>
				</DetailsLayout>
			</View>
		</View>
	);
};

export default ChatVideoCallScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	safeArea: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	headerInfo: {
		flex: 1,
		alignItems: "center",
		gap: 2,
	},
	cameraToggle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	pipContainer: {
		position: "absolute",
		bottom: 200,
		right: 20,
		width: 120,
		height: 160,
		borderRadius: 10,
		backgroundColor: "#000000",
		overflow: "hidden",
		borderWidth: 3,
	},
	controlsContainer: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
	},
	controls: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 20,
	},
	controlButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
	},
});
