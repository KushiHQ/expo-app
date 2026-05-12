import { Stack } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

if (process.env.EXPO_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID) {
	GoogleSignin.configure({
		webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID,
		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_OAUTH_CLIENT_ID,
		offlineAccess: true,
	});
}

export default function Layout() {
	return (
		<Stack>
			<Stack.Screen name="sign-up" options={{ headerShown: false }} />
			<Stack.Screen name="sign-in" options={{ headerShown: false }} />
			<Stack.Screen name="forgot-password" options={{ headerShown: false }} />
			<Stack.Screen name="otp-verification" options={{ headerShown: false }} />
			<Stack.Screen name="reset-password" options={{ headerShown: false }} />
		</Stack>
	);
}
