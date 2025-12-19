import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import { IconParkOutlineDot } from "@/components/icons/i-circle";
import Logo from "@/components/icons/i-logo";
import DetailsLayout from "@/components/layouts/details";
import ChatInput, { ChatInputData } from "@/components/organisms/o-chat-input";
import ChatMessageBubble from "@/components/molecules/m-chat-message-bubble";
import HostingChatSummaryCard from "@/components/molecules/m-hosting-chat-summary-card";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	ChatMessagesQuery,
	CreateUpdateMessageMutation,
	CreateUpdateMessageMutationVariables,
	LatestHostingChatMessageSubscription,
	OnlineUserSubscription,
	useChatMessagesQuery,
	useClearChatUrnreadMessagesMutation,
	useHostingChatQuery,
	useLatestHostingChatMessageSubscription,
	useOnlineUserSubscription,
} from "@/lib/services/graphql/generated";
import { CREATE_UPDATE_MESSAGE } from "@/lib/services/graphql/requests/mutations/hosting-chat";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { generateRNFile } from "@/lib/utils/file";
import { getImagePlaceholderUrl } from "@/lib/utils/urls";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

export default function ChatDetails() {
	const { id } = useLocalSearchParams();
	const colors = useThemeColors();
	const scrollViewRef = React.useRef<ScrollView>(null);
	const [onlineRecipient, setOnlineRecipeint] =
		React.useState<OnlineUserSubscription["onlineUser"]>();
	const [{ fetching, data, error }] = useChatMessagesQuery({
		variables: { chatId: cast(id) },
	});
	const [{ fetching: chatFetching, data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});
	const [messages, setMessages] = React.useState<
		ChatMessagesQuery["chatMessages"]
	>([]);

	const [, clearUnread] = useClearChatUrnreadMessagesMutation();

	const handleNewMessage = (
		msg: LatestHostingChatMessageSubscription["latestHostingChatMessage"],
	) => {
		setMessages((c) => {
			const items = [...c];
			const itemIndex = items.findIndex((v) => v.id == msg.id);
			if (itemIndex >= 0) {
				items[itemIndex] = msg;
			} else {
				items.push(msg);
			}

			return items;
		});
	};

	useLatestHostingChatMessageSubscription(
		{
			variables: { chatId: cast(id) },
		},
		(
			prev: LatestHostingChatMessageSubscription["latestHostingChatMessage"][] = [],
			curr,
		) => {
			handleNewMessage(curr.latestHostingChatMessage);
			return [curr.latestHostingChatMessage, ...(prev ?? [])];
		},
	);

	React.useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				scrollViewRef.current?.scrollTo({ y: 999999, animated: true });
			}, 100);
		}
	}, [messages]);

	React.useEffect(() => {
		clearUnread({ chatId: cast(id) });
	}, []);

	React.useEffect(() => {
		if (error) {
			handleError(error);
		}
	}, [error]);

	React.useEffect(() => {
		if (data?.chatMessages) {
			setMessages(data.chatMessages);
		}
	}, [data?.chatMessages]);

	useOnlineUserSubscription(
		{
			variables: {
				userId: chatData?.hostingChat.recipientUser?.id ?? "",
			},
			pause: !chatData?.hostingChat.recipientUser?.id,
		},
		(prev: OnlineUserSubscription["onlineUser"][] = [], curr) => {
			setOnlineRecipeint(curr.onlineUser);
			return [curr.onlineUser, ...prev];
		},
	);

	const handleSend = (input: ChatInputData) => {
		formMutation<
			CreateUpdateMessageMutation,
			CreateUpdateMessageMutationVariables
		>(CREATE_UPDATE_MESSAGE, {
			input: {
				text: input.text,
				assets: [
					...input.documents.map((doc) => generateRNFile(doc.uri)),
					...input.images.map((uri) => generateRNFile(uri)),
				],
				chatId: cast(id),
			},
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.createUpdateMessage.id) {
				handleNewMessage(res.data.createUpdateMessage);
			}
		});
	};

	return (
		<>
			<DetailsLayout
				ref={scrollViewRef}
				avatar={{
					image: getImagePlaceholderUrl(
						chatData?.hostingChat.recipientUser?.profile.gender,
					),
					online: onlineRecipient?.online,
					lastSeen: onlineRecipient?.lastSeen,
				}}
				title={chatData?.hostingChat.recipientUser?.profile.fullName}
				withPhone
				withVideo
				footer={<ChatInput onSend={handleSend} />}
			>
				<View className="mt-4">
					<View className="items-center justify-center">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							{chatData?.hostingChat.recipientUser?.profile.fullName}
						</ThemedText>
						{onlineRecipient?.online && (
							<View className="flex-row items-center">
								<ThemedText
									style={{ color: hexToRgba(colors.text, 0.5), fontSize: 10 }}
								>
									Active Now
								</ThemedText>
								<IconParkOutlineDot color={colors.success} size={12} />
							</View>
						)}
					</View>
					<View className="mt-8">
						<HostingChatSummaryCard hosting={chatData?.hostingChat.hosting} />
						<View className="gap-4 mt-8">
							{messages.map((message) => (
								<ChatMessageBubble key={message.id} message={message} />
							))}
						</View>
						{!messages.length && !fetching && (
							<View className="items-center gap-4 mt-8">
								<View
									className="items-center aspect-square p-8 px-16 rounded-full opacity-35 justify-center"
									style={{ backgroundColor: hexToRgba(colors.text, 0.2) }}
								>
									<Logo width={120} height={140} />
								</View>
								<ThemedText type="semibold" className="opacity-40">
									Chat is empty
								</ThemedText>
							</View>
						)}
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={fetching || chatFetching} />
		</>
	);
}
