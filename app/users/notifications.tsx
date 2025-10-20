import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";
import NotificationBell from "@/assets/vectors/notification-bell.svg";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { useAtom } from "jotai";
import { notificationsAtom } from "@/lib/stores/notifications";
import React from "react";
import {
	generateMockNotifications,
	NOTIFICATION_CATEGORY,
} from "@/lib/constants/mocks/notifications";
import NotificationCard from "@/components/molecules/m-notification-card";
import Button from "@/components/atoms/a-button";
import { cast } from "@/lib/types/utils";

export default function UserNotifications() {
	const colors = useThemeColors();
	const [notifications, setNotification] = useAtom(notificationsAtom);
	const [filter, setFilter] = React.useState<"All" | "Guest Alerts" | "System">(
		"All",
	);

	const filteredNotifications = React.useMemo(() => {
		if (filter !== "All") {
			return notifications.filter((v) => v.category !== filter);
		}
		return notifications;
	}, [filter, notifications]);

	React.useEffect(() => {
		if (!notifications.length) {
			setNotification(generateMockNotifications(20));
		}
	}, []);

	return (
		<DetailsLayout title="Notifications">
			{!notifications.length ? (
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
						<ThemedText style={{ fontSize: 14 }}>
							Stay updated on your listings, inquiries, and system alerts.
						</ThemedText>
						<View className="flex-row items-baseline">
							{["All", ...NOTIFICATION_CATEGORY].map((v, index) => (
								<Button
									key={index}
									onPress={() => setFilter(cast(v))}
									className="border-b"
									style={{
										borderColor: v === filter ? colors.text : "#000",
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
						{filteredNotifications.map((notification, index) => (
							<NotificationCard notification={notification} key={index} />
						))}
					</View>
				</View>
			)}
		</DetailsLayout>
	);
}
