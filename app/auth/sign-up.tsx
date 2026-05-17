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
	useAppleSignUpMutation,
	useGoogleSignUpMutation,
	useSignUpMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, View, Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { saveAuthTokens } from "@/lib/utils/auth";
import { useUser } from "@/lib/hooks/user";
import { UserType } from "@/lib/types/users";
import { Fonts } from "@/lib/constants/theme";
import * as AppleAuthentication from "expo-apple-authentication";
export default function SignUp() {
	const colors = useThemeColors();
	const [inputs, setInputs] = React.useState<Partial<SignUpInput>>({});
	const [res, mutate] = useSignUpMutation();
	const router = useRouter();
	const { updateUser, user, returnUrl, setReturnUrl } = useUser();
	const [, googleSignUp] = useGoogleSignUpMutation();
	const [, appleSignUp] = useAppleSignUpMutation();

	const handlePostLogin = (userType?: UserType) => {
		if (returnUrl) {
			const destination = returnUrl;
			setReturnUrl(null);
			router.replace(destination as any);
		} else if (userType === UserType.Host) {
			router.replace("/host/analytics");
		} else {
			router.replace("/guest/home");
		}
	};

	const signUpWithGoogle = async () => {
		try {
			if (Platform.OS === "android") {
				await GoogleSignin.hasPlayServices();
			}
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
						handlePostLogin(user.userType);
					}
				});
		} catch (error: any) {
			console.error("Something went wrong:", error);
		}
	};
	const signUpWithApple = async () => {
		if (Platform.OS === "android") {
			try {
				const redirectUri = Linking.createURL("/auth/sign-up");
				const authUrl = `https://kushicorp.com/auth/signup?redirect_uri=${encodeURIComponent(redirectUri)}`;

				const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
					preferEphemeralSession: true,
				});

				if (result.type === "success") {
					const { url } = result;
					const params = new URL(url).searchParams;
					const identityToken = params.get("identityToken");
					const fullName = params.get("fullName");

					if (identityToken) {
						appleSignUp({
							input: {
								identityToken,
								fullName: fullName ?? undefined,
							},
						}).then((res) => {
							if (res.error) {
								handleError(res.error);
							}
							if (res.data?.appleSignUp.data) {
								Toast.show({
									type: "success",
									text1: "Success",
									text2: res.data.appleSignUp.message,
								});
								saveAuthTokens({
									access: res.data.appleSignUp.data.token,
									refresh: res.data.appleSignUp.data.refreshToken,
								});
								updateUser({
									tokenData: { expiresAt: res.data.appleSignUp.data.expiresAt },
									user: res.data?.appleSignUp.data?.user,
									email: res.data?.appleSignUp.data?.user.email,
								});
								handlePostLogin(user.userType);
							}
						});
					}
				}
			} catch (error) {
				console.error("Apple Sign-Up Error:", error);
			}
			return;
		}

		try {
			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			});
			if (credential.identityToken) {
				appleSignUp({
					input: {
						identityToken: credential.identityToken,
						fullName: credential.fullName?.givenName
							? `${credential.fullName.givenName} ${credential.fullName.familyName || ""}`.trim()
							: undefined,
					},
				}).then((res) => {
					if (res.error) {
						handleError(res.error);
					}
					if (res.data?.appleSignUp.data) {
						Toast.show({
							type: "success",
							text1: "Success",
							text2: res.data.appleSignUp.message,
						});
						saveAuthTokens({
							access: res.data.appleSignUp.data.token,
							refresh: res.data.appleSignUp.data.refreshToken,
						});
						updateUser({
							tokenData: { expiresAt: res.data.appleSignUp.data.expiresAt },
							user: res.data?.appleSignUp.data?.user,
							email: res.data?.appleSignUp.data?.user.email,
						});
						handlePostLogin(user.userType);
					}
				});
			}
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
						<ThemedText>or continue with</ThemedText>
					</Centered>
					<View className="flex-row items-center justify-center gap-3">
						<Pressable
							onPress={signUpWithGoogle}
							style={{
								backgroundColor: hexToRgba(colors["text"], 0.1),
								borderColor: hexToRgba(colors["text"], 0.2),
							}}
							className="flex-row items-center justify-center w-full max-w-[144px] gap-3 rounded-full h-12 border"
						>
							<LogosGoogle />
							<ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
								Google
							</ThemedText>
						</Pressable>
						<Pressable
							aria-label="Sign Up with Apple"
							onPress={signUpWithApple}
							style={{
								backgroundColor: hexToRgba(colors["text"], 0.1),
								borderColor: hexToRgba(colors["text"], 0.2),
							}}
							className="flex-row items-center justify-center w-full max-w-[144px] gap-3 rounded-full h-12 border"
						>
							<LogosApple />
							<ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
								Apple
							</ThemedText>
						</Pressable>
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
