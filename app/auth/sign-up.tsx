import Button from "@/components/atoms/a-button";
import Centered from "@/components/atoms/a-centered";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import { LogosApple, LogosGoogle } from "@/components/icons/i-logos";
import AuthLayout from "@/components/layouts/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	SignUpInput,
	useGoogleSignUpMutation,
	useSignUpMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { saveAuthTokens } from "@/lib/utils/auth";
import { useUser } from "@/lib/hooks/user";
import { UserType } from "@/lib/types/users";

export default function SignUp() {
	const colors = useThemeColors();
	const [inputs, setInputs] = React.useState<Partial<SignUpInput>>({});
	const [res, mutate] = useSignUpMutation();
	const router = useRouter();
	const { updateUser, user } = useUser();
	const [, googleSignUp] = useGoogleSignUpMutation();

	const signUpWithGoogle = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			if (userInfo.data?.idToken)
				googleSignUp({
					idToken: userInfo.data?.idToken,
				}).then((res) => {
					if (res.error) {
						handleError(res.error);
					}
					if (res.data?.googleSignUp.data) {
						Toast.show({
							type: "success",
							text1: "Success",
							text2: res.data.googleSignUp.message,
						});
						saveAuthTokens({
							access: res.data.googleSignUp.data.token,
							refresh: res.data.googleSignUp.data.refreshToken,
						});
						updateUser({
							tokenData: { expiresAt: res.data.googleSignUp.data.expiresAt },
							user: res.data?.googleSignUp.data?.user,
							email: res.data?.googleSignUp.data?.user.email,
						});
						if (user.userType === UserType.Host) {
							router.replace("/host/analytics");
						} else {
							router.replace("/guest/home");
						}
					}
				});
		} catch (error: any) {
			console.error("Something went wrong:", error);
		}
	};

	const handlePress = () => {
		mutate({ input: cast(inputs) }).then((result) => {
			if (result.error) {
				handleError(result.error);
			}
			if (result.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: result.data.signUp.message,
				});
				router.replace(`/auth/otp-verification?email=${inputs.email}`);
			}
		});
	};

	return (
		<AuthLayout
			title="Create Account"
			description="Sign up easily with your email or social accounts"
		>
			<View className="mt-10 flex-1 justify-between">
				<View className="gap-4">
					<View className="gap-4 min-h-[300px]">
						<FloatingLabelInput
							focused
							inputMode="text"
							autoComplete="name"
							placeholder="Enter your name"
							label="Full Name"
							onChangeText={(v) => setInputs((c) => ({ ...c, fullName: v }))}
						/>
						<FloatingLabelInput
							focused
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
					<Button
						onPress={handlePress}
						loading={res.fetching}
						type="primary"
						disabled={
							res.fetching ||
							!inputs.fullName?.length ||
							!inputs.email?.length ||
							!inputs.password?.length
						}
					>
						<ThemedText content="primary">Sign Up</ThemedText>
					</Button>
					<Centered className="mt-1">
						<ThemedText>or</ThemedText>
					</Centered>
					<View className="items-center flex-row justify-center gap-8">
						<Pressable
							onPress={signUpWithGoogle}
							style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
							className="w-9 h-9 items-center justify-center rounded-full p-1"
						>
							<LogosGoogle />
						</Pressable>
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
					<Link href="/auth/sign-in">
						<ThemedText content="tinted" className="underline">
							Log in
						</ThemedText>
					</Link>
				</View>
			</View>
		</AuthLayout>
	);
}
