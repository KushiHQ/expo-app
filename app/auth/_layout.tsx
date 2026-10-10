import { Stack } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

if (process.env.EXPO_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID) {
	GoogleSignin.configure({
		webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_OAUTH_CLIENT_ID,
		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_OAUTH_CLIENT_ID,
		offlineAccess: true
	});
}

export default function AuthLayout() {
	return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07080B' } }} />;
}
