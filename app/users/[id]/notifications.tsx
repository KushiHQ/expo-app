import ThemedSwitch from "@/components/atoms/a-themed-switch";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { notificationSettingsAtom } from "@/lib/stores/notification-settings";
import { useAtom } from "jotai";
import { View } from "react-native";

export default function UserNotifications() {
	const [notificationSettings, setNotificationSettings] = useAtom(
		notificationSettingsAtom,
	);

	return (
		<DetailsLayout title="Notification Settings">
			<View className="mt-6 gap-8">
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>SMS</ThemedText>
					<ThemedSwitch
						value={notificationSettings.sms}
						onValueChange={(value) =>
							setNotificationSettings((c) => ({ ...c, sms: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>In App</ThemedText>
					<ThemedSwitch
						value={notificationSettings.inApp}
						onValueChange={(value) =>
							setNotificationSettings((c) => ({ ...c, inApp: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>Email</ThemedText>
					<ThemedSwitch
						value={notificationSettings.email}
						onValueChange={(value) =>
							setNotificationSettings((c) => ({ ...c, email: value }))
						}
					/>
				</View>
				{notificationSettings.inApp && (
					<>
						<View className="flex-row items-center justify-between">
							<ThemedText style={{ fontFamily: Fonts.medium }}>
								Sound
							</ThemedText>
							<ThemedSwitch
								value={notificationSettings.sound}
								onValueChange={(value) =>
									setNotificationSettings((c) => ({ ...c, sound: value }))
								}
							/>
						</View>
						<View className="flex-row items-center justify-between">
							<ThemedText style={{ fontFamily: Fonts.medium }}>
								Vibrate
							</ThemedText>
							<ThemedSwitch
								value={notificationSettings.vibrate}
								onValueChange={(value) =>
									setNotificationSettings((c) => ({ ...c, vibrate: value }))
								}
							/>
						</View>
					</>
				)}
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Special Offers
					</ThemedText>
					<ThemedSwitch
						value={notificationSettings.specialOffers}
						onValueChange={(value) =>
							setNotificationSettings((c) => ({ ...c, specialOffers: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						App Updates
					</ThemedText>
					<ThemedSwitch
						value={notificationSettings.appUpdates}
						onValueChange={(value) =>
							setNotificationSettings((c) => ({ ...c, appUpdates: value }))
						}
					/>
				</View>
			</View>
		</DetailsLayout>
	);
}
