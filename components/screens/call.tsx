import { useActiveCall } from "@/lib/hooks/call";
import CallBackground from "../atoms/a-call-background";
import DetailsLayout from "../layouts/details";
import { Pressable, View } from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { F7PhoneDownFill, Fa7SolidPhone } from "../icons/i-phone";
import { QlementineIconsSpeaker16 } from "../icons/i-speaker";
import React from "react";
import { useHostingChatQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import CallParticipantProfile from "../molecules/m-call-participant-profile";
import { Mic, MicOff } from "lucide-react-native";

type Props = {
	callData?: ReturnType<typeof useActiveCall>;
};

const CallScreen: React.FC<Props> = ({ callData }) => {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const colors = useThemeColors();
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});

	const recipient = chatData?.hostingChat.recipientUser;

	return (
		<CallBackground>
			<DetailsLayout
				background="transparent"
				title={
					callData?.isRinging || !callData
						? !callData || callData?.isCaller
							? "Calling..."
							: "Incoming Call"
						: recipient?.profile.fullName
				}
				backButton="solid"
			>
				<View className="flex-1 justify-between">
					<CallParticipantProfile callData={callData} withDuration />
					<View className="flex-row items-center justify-center gap-10 p-6">
						{!callData?.isCaller && callData?.isRinging ? (
							<>
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
										<Fa7SolidPhone size={37} color={colors["shade-content"]} />
									</Pressable>
									<ThemedText>Answer</ThemedText>
								</View>
							</>
						) : (
							<>
								<Pressable
									onPress={() => callData?.toggleSpeakerOn()}
									className="w-16 h-16 rounded-full items-center justify-center"
									style={{
										backgroundColor: callData?.isSpeakerOn
											? "white"
											: colors.shade,
									}}
								>
									<QlementineIconsSpeaker16
										size={28}
										color={
											callData?.isSpeakerOn ? "black" : colors["shade-content"]
										}
									/>
								</Pressable>
								<Pressable
									onPress={() => {
										if (callData) {
											callData?.leaveCall();
										} else {
											router.back();
										}
									}}
									className="w-24 h-24 rounded-full items-center justify-center"
									style={{ backgroundColor: colors.error }}
								>
									<F7PhoneDownFill size={37} color={colors["shade-content"]} />
								</Pressable>
								<Pressable
									onPress={() => callData?.toggleMic()}
									className="w-16 h-16 rounded-full items-center justify-center"
									style={{
										backgroundColor: !callData?.micEnabled
											? "white"
											: colors.shade,
									}}
								>
									{!callData?.micEnabled ? (
										<MicOff size={28} color="black" />
									) : (
										<Mic size={28} color="white" />
									)}
								</Pressable>
							</>
						)}
					</View>
				</View>
			</DetailsLayout>
		</CallBackground>
	);
};

export default CallScreen;
