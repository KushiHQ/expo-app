import ThemedText from "@/components/atoms/a-themed-text";
import {
	F7PhoneDownFill,
	Fa7SolidPhone,
	HugeiconsVideo01,
} from "@/components/icons/i-phone";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import DetailsLayout from "@/components/layouts/details";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	useHostingChatQuery,
	useSendChatVoiceCallNotificationMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { getImagePlaceholderUrl } from "@/lib/utils/urls";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View, Pressable } from "react-native";
import { useUser } from "@/lib/hooks/user";
import CallBackground from "@/components/atoms/a-call-background";
import { useCall, useCallStateHooks } from "@stream-io/video-react-native-sdk";
import { handleError } from "@/lib/utils/error";

export default function ChatCall() {
	const router = useRouter();
	const colors = useThemeColors();
	const { useParticipants } = useCallStateHooks();
	const { id, initiate } = useLocalSearchParams();
	const { user } = useUser();
	const participants = useParticipants();
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});
	const call = useCall();
	const [_, sendNotification] = useSendChatVoiceCallNotificationMutation();

	React.useEffect(() => {
		if (!call) {
			router.replace(`/chats/${id}`);
		}
	}, [call]);

	React.useEffect(() => {
		if (
			initiate === "true" &&
			!participants.find((p) => p.userId === user.user?.id)
		) {
			sendNotification({ chatId: cast(id) }).then((res) => {
				if (res.error) {
					handleError(res.error);
				}
			});
			call?.join();
		}
	}, [initiate, call, participants, user]);

	return (
		<CallBackground>
			<DetailsLayout
				background="transparent"
				title={initiate !== "true" ? "Incoming Call" : "Calling..."}
				backButton="solid"
			>
				<View className="flex-1 justify-between">
					<View className="flex-1 items-center gap-4 pb-28 justify-center">
						<View
							className="h-[160px] w-[160px] border-[6px]"
							style={{
								borderRadius: 999,
								borderColor: colors.primary,
							}}
						>
							<Image
								source={getImagePlaceholderUrl(
									chatData?.hostingChat.recipientUser.profile.gender,
								)}
								style={{
									height: "100%",
									width: "100%",
									borderRadius: 999,
								}}
								contentFit="cover"
								transition={300}
								placeholder={{ blurhash: PROPERTY_BLURHASH }}
								placeholderContentFit="cover"
								cachePolicy="memory-disk"
								priority="high"
							/>
						</View>
						<View className="items-center gap-1">
							<ThemedText
								style={{
									fontSize: 18,
									color: "white",
									fontFamily: Fonts.medium,
								}}
							>
								{initiate !== "true" ? "Incoming Call" : "Calling..."}
							</ThemedText>
							<ThemedText
								style={{
									fontSize: 14,
									color: hexToRgba("#ffffff", 0.6),
								}}
							>
								{chatData?.hostingChat.recipientUser.profile.fullName}
							</ThemedText>
						</View>
					</View>
					<View className="flex-row items-center justify-center gap-10 p-6">
						{initiate !== "true" &&
							!participants.find((c) => c.userId === user.user?.id) ? (
							<>
								<View className="items-center gap-2 mr-8">
									<Pressable
										onPress={() => {
											call?.leave();
											router.replace(`/chats/${id}`);
										}}
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
										onPress={() => call?.join()}
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
									className="w-16 h-16 rounded-full items-center justify-center"
									style={{ backgroundColor: colors.shade }}
								>
									<QlementineIconsSpeaker16
										size={28}
										color={colors["shade-content"]}
									/>
								</Pressable>
								<Pressable
									className="w-24 h-24 rounded-full items-center justify-center"
									style={{ backgroundColor: colors.error }}
								>
									<F7PhoneDownFill size={37} color={colors["shade-content"]} />
								</Pressable>
								<Pressable
									onPress={() => router.push(`/chats/${id}/call/video`)}
									className="w-16 h-16 rounded-full items-center justify-center"
									style={{ backgroundColor: colors.shade }}
								>
									<HugeiconsVideo01 size={28} color={colors["shade-content"]} />
								</Pressable>
							</>
						)}
					</View>
				</View>
			</DetailsLayout>
		</CallBackground>
	);
}
