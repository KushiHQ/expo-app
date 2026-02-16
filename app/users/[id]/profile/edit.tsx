import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import UserProfileSummary from "@/components/molecules/m-user-profile-summary";
import { useUser } from "@/lib/hooks/user";
import {
	ProfileUpdateInput,
	User,
	useUpdateProfileMutation,
} from "@/lib/services/graphql/generated";
import { handleError } from "@/lib/utils/error";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function UserProfileEdit() {
	const { user, updateUser } = useUser();
	const router = useRouter();
	const [inputs, setInputs] = React.useState({
		fullName: user.user?.profile.fullName,
		gender: user.user?.profile.gender,
	} as ProfileUpdateInput);
	const [{ fetching }, updateProfile] = useUpdateProfileMutation();

	const handleUpdate = () => {
		updateProfile({ input: inputs }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.updateProfile.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.updateProfile.message,
				});
				updateUser({
					user: {
						...(user.user ?? ({} as User)),
						profile: res.data.updateProfile.data,
					},
				});
			}
		});
	};

	return (
		<>
			<DetailsLayout title="Profile">
				<View className="mt-8 flex-1 justify-between gap-4">
					<View className="min-h-[465px]">
						<UserProfileSummary edit />
						<View className="mt-8 gap-4">
							<FloatingLabelInput
								focused
								label="Full Name"
								autoComplete="name"
								value={inputs.fullName}
								onChangeText={(v) => setInputs((c) => ({ ...c, fullName: v }))}
								placeholder="John Doe"
							/>
							<FloatingLabelInput
								focused
								label="Email"
								inputMode="email"
								autoComplete="email"
								disabled
								value={user.user?.email}
								placeholder="example@email.com"
							/>
							<View className="flex-row gap-4 items-center">
								<View className="flex-[1.5]">
									<FloatingLabelInput
										focused
										disabled
										label="Password"
										placeholder="********"
										secureTextEntry
									/>
								</View>
								<Button
									className="flex-1"
									type="primary"
									onPress={() => router.push("/auth/reset-password")}
								>
									<ThemedText content="primary">Change</ThemedText>
								</Button>
							</View>
						</View>
					</View>
					<Button
						type="primary"
						onPress={handleUpdate}
						disabled={
							user.user?.profile.fullName === inputs.fullName &&
							user.user.profile.gender === inputs.gender
						}
					>
						<ThemedText content="primary">Update</ThemedText>
					</Button>
				</View>
			</DetailsLayout>
			<LoadingModal visible={fetching} />
		</>
	);
}
