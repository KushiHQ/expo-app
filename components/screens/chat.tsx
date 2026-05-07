import ThemedText from "@/components/atoms/a-themed-text";
import { LineiconsSearch1 } from "@/components/icons/i-search";
import DetailsLayout from "@/components/layouts/details";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUserChatsQuery } from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { AUDIO_EXTENSIONS } from "@/lib/utils/file";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Mic } from "lucide-react-native";
import moment from "moment";
import React from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	TextInput,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import Skeleton from "../atoms/a-skeleton";
import EmptyList from "../molecules/m-empty-list";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

const ChatListItem = ({
	chat,
	router,
	colors,
}: {
	chat: any;
	router: any;
	colors: any;
}) => {
	const pressScale = useSharedValue(1);
	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pressScale.value }],
	}));

	return (
		<AnimatedPressable
			onPressIn={() => (pressScale.value = withSpring(0.97))}
			onPressOut={() => (pressScale.value = withSpring(1))}
			onPress={() => router.push(`/chats/${chat.id}/`)}
			style={[
				{
					backgroundColor: colors["surface-01"],
					borderRadius: 20,
					marginBottom: 12,
					padding: 12,
					flexDirection: "row",
					gap: 12,
					alignItems: "center",
					shadowColor: colors.text,
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.03,
					shadowRadius: 8,
					elevation: 2,
				},
				animatedStyle,
			]}
		>
			<View className="h-14 w-14 relative">
				<Image
					source={{
						uri: getDefaultProfileImageUrl(
							chat.recipientUser.profile.fullName ?? "",
						),
					}}
					style={{
						height: "100%",
						width: "100%",
						borderRadius: 28,
					}}
					contentFit="cover"
					transition={300}
					placeholder={{ blurhash: PROPERTY_BLURHASH }}
					placeholderContentFit="cover"
				/>
				{chat.recipientUser.onlineUser.online && (
					<View
						className="absolute right-0 bottom-0 w-3.5 h-3.5 border-2 rounded-full"
						style={{
							backgroundColor: colors.success,
							borderColor: colors["surface-01"],
						}}
					/>
				)}
			</View>
			<View className="flex-1 justify-center gap-1">
				<View className="flex-row items-center justify-between">
					<ThemedText
						numberOfLines={1}
						style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
					>
						{chat.recipientUser.profile.fullName}
					</ThemedText>
					<ThemedText
						style={{
							fontSize: 11,
							fontFamily: Fonts.medium,
							color: hexToRgba(colors.text, 0.4),
						}}
					>
						{moment(chat.lastUpdated).fromNow()}
					</ThemedText>
				</View>
				<View className="flex-row items-center justify-between gap-2">
					{(() => {
						const lastMessage = chat.lastMessage;
						if (!lastMessage) return <View className="flex-1" />;
						const audioAsset = lastMessage.assets.find((a: any) => {
							const url = a.asset.publicUrl.toLowerCase();
							return (
								a.asset.contentType?.includes("audio") ||
								AUDIO_EXTENSIONS.some((ext) => url.endsWith(`.${ext}`))
							);
						});

						const isAudioOnly =
							audioAsset &&
							(!lastMessage.text || lastMessage.text.trim().length === 0);

						return (
							<View className="flex-row items-center gap-1 flex-1">
								{isAudioOnly && (
									<Mic size={14} color={hexToRgba(colors.text, 0.5)} />
								)}
								<ThemedText
									numberOfLines={1}
									style={{
										fontSize: 13,
										color: hexToRgba(colors.text, 0.5),
										flex: 1,
									}}
								>
									{isAudioOnly ? "Voice message" : lastMessage.text}
								</ThemedText>
							</View>
						);
					})()}
					{chat.unreadMessageCount > 0 && (
						<View
							style={{ backgroundColor: colors.primary }}
							className="px-2 py-0.5 min-w-[20px] items-center justify-center rounded-full"
						>
							<ThemedText
								style={{
									fontSize: 10,
									fontFamily: Fonts.bold,
									color: "#fff",
								}}
							>
								{chat.unreadMessageCount}
							</ThemedText>
						</View>
					)}
				</View>
			</View>
		</AnimatedPressable>
	);
};

const ChatScreen: React.FC<Props> = ({ variant = "guest" }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const [searchText, setSearchText] = React.useState("");
	const debouncedSearchText = useDebounce(searchText, 500);

	const initialVariables = React.useMemo(() => ({}), []);

	const {
		items: userChats,
		fetching: chatsFetching,
		loadMore,
		hasNextPage,
		refresh,
		setVariables,
	} = useInfiniteQuery(useUserChatsQuery, {
		queryKey: "userChats",
		initialVariables,
	});

	React.useEffect(() => {
		if (debouncedSearchText) {
			setVariables({ filter: { text: debouncedSearchText } });
		} else {
			setVariables({});
		}
	}, [debouncedSearchText]);

	return (
		<DetailsLayout
			title="Messages"
			withProfile
			variant={variant}
			scrollable={false}
		>
			<FlatList
				data={userChats}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
				renderItem={({ item: chat }) => (
					<ChatListItem chat={chat} router={router} colors={colors} />
				)}
				ListHeaderComponent={
					<View className="mb-4">
						<View
							className="flex-row items-center gap-2 p-4 py-3 rounded-2xl border"
							style={{
								backgroundColor: colors["surface-01"],
								borderColor: hexToRgba(colors.text, 0.08),
							}}
						>
							<LineiconsSearch1
								color={hexToRgba(colors["text"], 0.4)}
								size={20}
							/>
							<TextInput
								value={searchText}
								onChangeText={setSearchText}
								className="flex-1"
								style={{
									color: colors["text"],
									fontSize: 16,
									fontFamily: Fonts.regular,
									height: 24,
									padding: 0,
								}}
								placeholderTextColor={hexToRgba(colors["text"], 0.4)}
								placeholder="Search messages..."
							/>
						</View>
						{chatsFetching && !userChats.length && (
							<View className="gap-3 mt-4">
								{Array.from({ length: 6 }).map((_, index) => (
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
