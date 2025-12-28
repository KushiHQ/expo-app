import Button from "@/components/atoms/a-button";
import Centered from "@/components/atoms/a-centered";
import Checkbox from "@/components/atoms/a-checkbox";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { LogosApple, LogosGoogle } from "@/components/icons/i-logos";
import AuthLayout from "@/components/layouts/auth";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { LoginInput, useLoginMutation } from "@/lib/services/graphql/generated";
import { UserType } from "@/lib/types/users";
import { cast } from "@/lib/types/utils";
import { saveAuthTokens } from "@/lib/utils/auth";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function Login() {
	const router = useRouter();
	const colors = useThemeColors();
	const { email } = useLocalSearchParams();
	const [inputs, setInputs] = React.useState<Partial<LoginInput>>({
		email: cast(email),
	});
	const { user, updateUser } = useUser();
	const [savePassword, setSavePassword] = React.useState(!!user.password);
	const [res, mutate] = useLoginMutation();

	const handlePress = () => {
		mutate({ input: cast(inputs) }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.login.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.login.message,
				});
				saveAuthTokens({
					access: res.data.login.data.token,
					refresh: res.data.login.data.refreshToken,
				});
				updateUser({
					tokenData: { expiresAt: res.data.login.data.expiresAt },
					password: savePassword ? inputs.password : undefined,
					user: res.data?.login.data?.user,
					email: inputs.email,
				});
				if (user.userType === UserType.Host) {
					router.replace("/host/analytics");
				} else {
					router.replace("/guest/home");
				}
			}
		});
	};

	return (
		<AuthLayout
			title="Sign In"
			description="Sign in easily with your email or social accounts"
		>
			<View className="mt-10 flex-1 justify-between">
				<View className="gap-4">
					<View className="gap-4 min-h-[150px]">
						<FloatingLabelInput
							focused
							value={inputs.email}
							inputMode="email"
							autoComplete="email"
							placeholder="@gmail.com"
							label="Email"
							onChangeText={(v) => setInputs((c) => ({ ...c, email: v }))}
						/>
						<FloatingLabelInput
							secureTextEntry
							inputMode="text"
							autoComplete="password"
							placeholder="**********"
							label="Password"
							onChangeText={(v) => setInputs((c) => ({ ...c, password: v }))}
						/>
					</View>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-1">
							<Checkbox
								onValueChange={setSavePassword}
								checked={savePassword}
								color={colors["primary"]}
							/>
							<ThemedText>Remember Password</ThemedText>
						</View>
						<Link href="/auth/forgot-password">
							<ThemedText>Forgot password?</ThemedText>
						</Link>
					</View>
					<Button
						onPress={handlePress}
						loading={res.fetching}
						type="primary"
						disabled={
							res.fetching || !inputs.email?.length || !inputs.password?.length
						}
					>
						<ThemedText content="primary">Sign In</ThemedText>
					</Button>
					<Centered className="mt-1">
						<ThemedText>or</ThemedText>
					</Centered>
					<View className="items-center flex-row justify-center gap-8">
						<View
							style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
							className="w-9 h-9 items-center justify-center rounded-full p-1"
						>
							<LogosGoogle />
						</View>
						<View
							style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
							className="w-9 h-9 items-center justify-center rounded-full p-1"
						>
							<LogosApple />
						</View>
					</View>
				</View>
				<View className="flex-row items-center justify-center mt-20 gap-1">
					<ThemedText>Already a member?</ThemedText>
					<Link href="/auth/sign-up">
						<ThemedText content="tinted" className="underline">
							Sign up
						</ThemedText>
					</Link>
				</View>
			</View>
		</AuthLayout>
	);
}
