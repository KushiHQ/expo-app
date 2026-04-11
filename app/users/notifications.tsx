import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";
import NotificationBell from "@/assets/vectors/notification-bell.svg";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import NotificationCard from "@/components/molecules/m-notification-card";
import Button from "@/components/atoms/a-button";
import { cast } from "@/lib/types/utils";
import {
	NotificationsFilterInput,
	NotificationType,
	useNotificationsQuery,
} from "@/lib/services/graphql/generated";

export default function UserNotifications() {
	const colors = useThemeColors();
	const [filter, setFilter] = React.useState({} as NotificationsFilterInput);
	const [{ data: notificationsData }] = useNotificationsQuery({
		variables: {
			pagination: { limit: 5 },
			filter,
		},
	});

	return (
		<DetailsLayout title="Notifications">
			{!(notificationsData?.notifications ?? []).length ? (
				<View className="flex-1 items-center justify-center">
					<View
						className="items-center justify-center gap-4 border rounded-xl p-10"
						style={{ borderColor: hexToRgba(colors.text, 0.2) }}
					>
						<NotificationBell />
						<ThemedText style={{ color: colors["primary-04"] }}>
							No Notifications Yet
						</ThemedText>
					</View>
				</View>
			) : (
				<View className="gap-8">
					<View className="gap-2">
						<View className="flex-row items-baseline">
							{["All", ...Object.keys(NotificationType)].map((v, index) => (
								<Button
									key={index}
									onPress={() => setFilter(cast(v))}
									className="border-b"
									style={{
										borderColor: v === filter ? colors.text : colors.background,
										borderRadius: 0,
									}}
								>
									<ThemedText
										style={{
											color:
												v === filter
													? colors.text
													: hexToRgba(colors.text, 0.6),
										}}
									>
										{v}
									</ThemedText>
								</Button>
							))}
						</View>
					</View>
					<View className="gap-2">
						{notificationsData?.notifications.map((notification, index) => (
							<NotificationCard notification={notification} key={index} />
						))}
					</View>
				</View>
			)}
		</DetailsLayout>
	);
}
