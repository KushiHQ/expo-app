import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { formatToShortTime } from "@/lib/utils/time";
import { twMerge } from "tailwind-merge";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { ChatMessagesQuery } from "@/lib/services/graphql/generated";
import ListDocument from "./m-list-document";
import ListImage from "../atoms/a-list-image";
import { useUser } from "@/lib/hooks/user";

type Props = {
	message: ChatMessagesQuery["chatMessages"][number];
};

const ChatMessageBubble: React.FC<Props> = ({ message }) => {
	const { user } = useUser();
	const colors = useThemeColors();
	const isSender = message.sender.id == user.user?.id;

	return (
		<View
			className={twMerge("max-w-[250px]", isSender && "items-end")}
			style={{
				alignSelf: isSender ? "flex-end" : "flex-start",
			}}
		>
			{message.assets.length > 0 && (
				<View
					className={twMerge(
						"mb-2 flex-row gap-4 flex-wrap",
						isSender ? "justify-end" : "justify-start",
					)}
				>
					{message.assets
						.filter((a) => a.asset.contentType?.includes("image"))
						.map((asset, index) => (
							<ListImage
								openable
								images={message.assets
									.filter((a) => a.asset.contentType?.includes("image"))
									.map((a) => a.asset.publicUrl)}
								src={asset.asset.publicUrl}
								index={index}
								key={index}
							/>
						))}
					{message.assets
						.filter((a) => !a.asset.contentType?.includes("image"))
						.map((asset, index) => (
							<ListDocument
								downloadable
								openable
								document={{ type: "remote", asset }}
								index={index}
								key={index}
							/>
						))}
				</View>
			)}
			<View
				className={twMerge(
					"p-3 rounded-2xl",
					isSender ? "rounded-tr-none" : "rounded-tl-none",
				)}
				style={{
					backgroundColor: isSender
						? colors.primary
						: hexToRgba(colors.text, 0.1),
				}}
			>
				<ThemedText
					style={{
						color: isSender ? colors["primary-content"] : colors.text,
					}}
				>
					{message.text}
				</ThemedText>
			</View>
			<ThemedText
				style={{ fontSize: 12, color: hexToRgba(colors.text, 0.7) }}
				className="px-1"
			>
				{formatToShortTime(message.lastUpdated)}
			</ThemedText>
		</View>
	);
};

export default ChatMessageBubble;
