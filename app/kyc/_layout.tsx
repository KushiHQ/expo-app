import { Stack } from 'expo-router';

/** Old verification URLs — every screen here redirects into /verify. */
export default function Layout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
