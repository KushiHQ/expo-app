import ThemedText from "@/components/atoms/a-themed-text";
import { LineiconsSearch1 } from "@/components/icons/i-search";
import DetailsLayout from "@/components/layouts/details";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { generateMockChatsWithHistory } from "@/lib/constants/mocks/chat";
import { Fonts } from "@/lib/constants/theme";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { chatsAtom } from "@/lib/stores/chats";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

type Props = {
	variant?: "guest" | "host";
};

const ChatScreen: React.FC<Props> = ({ variant = "guest" }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [chats, setChats] = useAtom(chatsAtom);
	const { failedImages, handleImageError } = useFallbackImages();

	React.useEffect(() => {
		if (!chats.length) {
			setChats(generateMockChatsWithHistory(20));
		}
	}, []);

	return (
		<DetailsLayout title="Message" withProfile variant={variant}>
			<View>
				<View
					className="flex-row items-center gap-2 p-4 py-2 rounded-full"
					style={{ backgroundColor: hexToRgba(colors["text"], 0.1) }}
				>
					<View className="flex-row items-center flex-1 gap-1">
						<LineiconsSearch1 color={hexToRgba(colors["text"], 0.5)} />
						<TextInput
							className="flex-1"
							style={{ color: colors["text"], fontSize: 18 }}
							placeholderTextColor={hexToRgba(colors["text"], 0.5)}
							placeholder="Search messages..."
						/>
					</View>
				</View>
				<View className="gap-2 mt-4">
					{chats.map((chat, index) => (
						<Pressable
							key={chat.id}
							onPress={() => router.push(`/chats/${chat.id}/`)}
							className="flex-row gap-4 py-2 items-center p-2"
						>
							<View className="h-[50px] w-[50px]">
								<Image
									source={{
										uri: failedImages.has(index)
											? FALLBACK_IMAGE
											: chat.user.avatar,
									}}
									style={{ height: "100%", width: "100%", borderRadius: 999 }}
									contentFit="cover"
									transition={300}
									placeholder={{ blurhash: PROPERTY_BLURHASH }}
									placeholderContentFit="cover"
									cachePolicy="memory-disk"
									priority="high"
									onError={() => handleImageError(index)}
									key={index}
								/>
							</View>
							<View className="flex-row gap-4 items-center justify-between flex-1">
								<View className="gap-1.5 flex-1">
									<ThemedText
										ellipsizeMode="tail"
										numberOfLines={1}
										style={{ fontFamily: Fonts.medium }}
									>
										{chat.user.name}
									</ThemedText>
									<ThemedText
										ellipsizeMode="tail"
										numberOfLines={1}
										style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
									>
										{chat.lastMessage}
									</ThemedText>
								</View>
								<View className="min-w-[50px] gap-[8px] items-end">
									{chat.unreadCount > 0 ? (
										<View
											style={{ backgroundColor: colors.primary }}
											className="w-4 h-4 items-center justify-center rounded-full"
										>
											<ThemedText
												content="primary"
												style={{ fontSize: 12 }}
												className="absolute"
											>
												{chat.unreadCount}
											</ThemedText>
										</View>
									) : (
										<View className="h-4"></View>
									)}
									<ThemedText
										style={{ fontSize: 12, fontFamily: Fonts.medium }}
									>
										{new Date(chat.date).toLocaleDateString()}
									</ThemedText>
								</View>
							</View>
						</Pressable>
					))}
				</View>
			</View>
		</DetailsLayout>
	);
};

export default ChatScreen;
