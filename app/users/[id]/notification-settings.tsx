import ThemedSwitch from "@/components/atoms/a-themed-switch";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import { Fonts } from "@/lib/constants/theme";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useUser } from "@/lib/hooks/user";
import {
	NotificationSettingsInput,
	User,
	useUpdateUserNotificationSettingsMutation,
} from "@/lib/services/graphql/generated";
import { handleError } from "@/lib/utils/error";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function UserNotificationSettings() {
	const { user, updateUser } = useUser();
	const [inputs, setInputs] = React.useState({
		email: user.user?.notificationSettings.email,
		pushNotifications: user.user?.notificationSettings.pushNotifications,
		specialOffers: user.user?.notificationSettings.specialOffers,
		appUpdates: user.user?.notificationSettings.appUpdates,
	} as NotificationSettingsInput);
	const debouncedInputs = useDebounce(inputs, 1000);
	const [_, updateNotifications] = useUpdateUserNotificationSettingsMutation();

	React.useEffect(() => {
		updateNotifications({ input: debouncedInputs }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.updateUserNotificationSettings.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.updateUserNotificationSettings.message,
				});
				updateUser({
					user: {
						...(user.user ?? ({} as User)),
						notificationSettings: res.data.updateUserNotificationSettings.data,
					},
				});
			}
		});
	}, [debouncedInputs]);

	return (
		<DetailsLayout title="Notification Settings">
			<View className="mt-6 gap-8">
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Notifications
					</ThemedText>
					<ThemedSwitch
						value={inputs.pushNotifications}
						onValueChange={(value) =>
							setInputs((c) => ({ ...c, pushNotifications: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>Email</ThemedText>
					<ThemedSwitch
						value={inputs.email}
						onValueChange={(value) =>
							setInputs((c) => ({ ...c, email: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Special Offers
					</ThemedText>
					<ThemedSwitch
						value={inputs.specialOffers}
						onValueChange={(value) =>
							setInputs((c) => ({ ...c, specialOffers: value }))
						}
					/>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						App Updates
					</ThemedText>
					<ThemedSwitch
						value={inputs.appUpdates}
						onValueChange={(value) =>
							setInputs((c) => ({ ...c, appUpdates: value }))
						}
					/>
				</View>
			</View>
		</DetailsLayout>
	);
}
