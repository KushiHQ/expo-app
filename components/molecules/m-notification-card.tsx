import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { Pressable, View } from "react-native";
import Logo from "../icons/i-logo";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import Button from "../atoms/a-button";
import { NotificationsQuery } from "@/lib/services/graphql/generated";

type Props = {
	notification: NotificationsQuery["notifications"][number];
};

const NotificationCard: React.FC<Props> = ({ notification }) => {
	const colors = useThemeColors();

	return (
		<Pressable
			className="flex-row items-center justify-between gap-4 p-4 rounded-xl"
			style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
		>
			<View className="flex-row items-center gap-4 flex-1">
				<View
					className="items-center justify-center rounded-full"
					style={{
						backgroundColor: hexToRgba(colors.primary, 0.2),
						width: 32,
						height: 32,
					}}
				>
					<Logo width={18} height={15} />
				</View>
				<View className="flex-1">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						{notification.title}
					</ThemedText>
					<ThemedText
						style={{ color: hexToRgba(colors.text, 0.6), fontSize: 12 }}
					>
						{notification.message}
					</ThemedText>
				</View>
			</View>
			<Button variant="outline" type="shade" className="py-2">
				<ThemedText>Update</ThemedText>
			</Button>
		</Pressable>
	);
};

export default NotificationCard;
