import { StreamCall, useCalls } from "@stream-io/video-react-native-sdk";
import React from "react";
import { Pressable, View } from "react-native";
import CallBackground from "@/components/atoms/a-call-background";
import DetailsLayout from "@/components/layouts/details";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { useHostingChatQuery } from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useLocalSearchParams } from "expo-router";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import ThemedText from "@/components/atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { QlementineIconsSpeaker16 } from "@/components/icons/i-speaker";
import { HeroiconsPhoneXMark } from "@/components/icons/i-phone";
import LoadingModal from "@/components/atoms/a-loading-modal";

const RingingCallHandler = () => {
	const { id } = useLocalSearchParams();
	const colors = useThemeColors();
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});
	const calls = useCalls().filter((c) => c.ringing);
	const ringingCall = calls[0];

	if (!ringingCall) return <LoadingModal visible />;

	return (
		<StreamCall call={ringingCall}>
			<CallBackground>
				<DetailsLayout
					background="transparent"
					title="Calling..."
					backButton="light"
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
									source={getDefaultProfileImageUrl(
										chatData?.hostingChat.recipientUser.profile.fullName ?? "",
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
									Calling
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
							<Pressable
								className="w-16 h-16 rounded-full items-center justify-center"
								style={{ backgroundColor: colors.shade }}
							>
								<QlementineIconsSpeaker16
									size={37}
									color={colors["shade-content"]}
								/>
							</Pressable>
							<Pressable
								className="w-16 h-16 rounded-full items-center justify-center"
								style={{ backgroundColor: colors.error }}
							>
								<HeroiconsPhoneXMark
									size={37}
									color={colors["shade-content"]}
								/>
							</Pressable>
						</View>
					</View>
				</DetailsLayout>
			</CallBackground>
		</StreamCall>
	);
};

export default RingingCallHandler;
