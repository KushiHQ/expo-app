import ThemedText from "@/components/atoms/a-themed-text";
import { LineiconsSearch1 } from "@/components/icons/i-search";
import DetailsLayout from "@/components/layouts/details";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUserChatsQuery } from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import React from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	TextInput,
	View,
} from "react-native";
import Skeleton from "../atoms/a-skeleton";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import EmptyList from "../molecules/m-empty-list";
import { Mic } from "lucide-react-native";
import { AUDIO_EXTENSIONS } from "@/lib/utils/file";

type Props = {
	variant?: "guest" | "host";
};

const ChatSkeleton = () => {
	return (
		<View className="px-2 flex-row gap-4">
			<Skeleton style={{ height: 54, width: 54, borderRadius: 9999 }} />
			<View className="py-2 flex-1 gap-3">
				<Skeleton style={{ height: 18, width: 70 }} />
				<Skeleton style={{ height: 14, width: "100%" }} />
			</View>
			<View className="py-2 gap-4 items-end">
				<Skeleton style={{ height: 14, width: 14, borderRadius: 9999 }} />
				<Skeleton style={{ height: 14, width: 50 }} />
			</View>
		</View>
	);
};

const ChatScreen: React.FC<Props> = ({ variant = "guest" }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const {
		items: userChats,
		fetching: chatsFetching,
		loadMore,
		hasNextPage,
		refresh,
	} = useInfiniteQuery(useUserChatsQuery, {
		queryKey: "userChats",
		initialVariables: {},
	});

	return (
		<DetailsLayout
			title="Message"
			withProfile
			variant={variant}
			scrollable={false}
		>
			<FlatList
				data={userChats}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 20, paddingTop: 0 }}
				renderItem={({ item: chat }) => (
					<Pressable
						onPress={() => router.push(`/chats/${chat.id}/`)}
						className="flex-row gap-4 py-2 items-center p-2"
					>
						<View className="h-[50px] relative w-[50px]">
							<Image
								source={{
									uri: getDefaultProfileImageUrl(
										chat.recipientUser.profile.fullName ?? "",
									),
								}}
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
							{chat.recipientUser.onlineUser.online && (
								<View
									className="absolute right-0 bottom-0 w-4 h-4 border rounded-full"
									style={{
										backgroundColor: colors.success,
										borderColor: colors.text,
									}}
								></View>
							)}
						</View>
						<View className="flex-row gap-4 items-center justify-between flex-1">
							<View className="gap-1.5 flex-1">
								<ThemedText
									ellipsizeMode="tail"
									numberOfLines={1}
									style={{ fontFamily: Fonts.medium }}
								>
									{chat.recipientUser.profile.fullName}
								</ThemedText>
								<View className="flex-row items-center gap-1">
									{(() => {
										const lastMessage = chat.lastMessage;
										if (!lastMessage) return null;
										const audioAsset = lastMessage.assets.find((a) => {
											const url = a.asset.publicUrl.toLowerCase();
											const hasAudioMime =
												a.asset.contentType?.includes("audio");
											const hasAudioExt = AUDIO_EXTENSIONS.some((ext) =>
												url.endsWith(`.${ext}`),
											);

											return hasAudioMime || hasAudioExt;
										});

										const isAudioOnly =
											audioAsset &&
											(!lastMessage.text ||
												lastMessage.text.trim().length === 0);

										return (
											<>
												{isAudioOnly && (
													<Mic size={14} color={hexToRgba(colors.text, 0.6)} />
												)}
												<ThemedText
													ellipsizeMode="tail"
													numberOfLines={1}
													style={{
														fontSize: 14,
														color: hexToRgba(colors.text, 0.6),
														flex: 1,
													}}
												>
													{isAudioOnly ? "Audio recording" : lastMessage.text}
												</ThemedText>
											</>
										);
									})()}
								</View>
							</View>
							<View className="min-w-[50px] gap-[8px] items-end">
								{chat.unreadMessageCount > 0 ? (
									<View
										style={{ backgroundColor: colors.primary }}
										className="w-4 h-4 items-center justify-center rounded-full"
									>
										<ThemedText
											content="primary"
											style={{ fontSize: 12 }}
											className="absolute"
										>
											{chat.unreadMessageCount}
										</ThemedText>
									</View>
								) : (
									<View className="h-4"></View>
								)}
								<ThemedText style={{ fontSize: 12, fontFamily: Fonts.medium }}>
									{new Date(chat.lastUpdated).toLocaleDateString()}
								</ThemedText>
							</View>
						</View>
					</Pressable>
				)}
				ListHeaderComponent={
					<View className="mb-4">
						<View
							className="flex-row items-center gap-2 p-4 py-2 rounded-xl"
							style={{ backgroundColor: hexToRgba(colors["text"], 0.1) }}
						>
							<View className="flex-row items-center flex-1 gap-1">
								<LineiconsSearch1 color={hexToRgba(colors["text"], 0.5)} />
								<TextInput
									className="flex-1"
									style={{ color: colors["text"], fontSize: 18, height: 40 }}
									placeholderTextColor={hexToRgba(colors["text"], 0.5)}
									placeholder="Search messages..."
								/>
							</View>
						</View>
						{chatsFetching && !userChats.length && (
							<View className="gap-2 mt-4">
								{Array.from({ length: 10 }).map((_, index) => (
									<ChatSkeleton key={index} />
								))}
							</View>
						)}
					</View>
				}
				ListEmptyComponent={
					!chatsFetching && !userChats.length ? (
						<EmptyList message="No chats yet" />
					) : null
				}
				onEndReached={() => hasNextPage && loadMore()}
				onEndReachedThreshold={0.5}
				refreshControl={
					<RefreshControl
						onRefresh={() => refresh()}
						refreshing={chatsFetching}
					/>
				}
			/>
		</DetailsLayout>
	);
};

export default ChatScreen;
