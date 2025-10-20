import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";
import NotificationBell from "@/assets/vectors/notification-bell.svg";
import ThemedText from "@/components/atoms/a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { useAtom } from "jotai";
import { notificationsAtom } from "@/lib/stores/notifications";
import React from "react";
import { generateMockNotifications } from "@/lib/constants/mocks/notifications";

export default function UserNotifications() {
	const colors = useThemeColors();
	const [notifications, setNotification] = useAtom(notificationsAtom);

	React.useEffect(() => {
		if (!notifications.length) {
			setNotification(generateMockNotifications(20));
		}
	}, []);

	return (
		<DetailsLayout title="Notifications">
			{!notifications.length && (
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
			)}
		</DetailsLayout>
	);
}
