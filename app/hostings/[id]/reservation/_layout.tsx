import { Stack } from 'expo-router';

/** Redirect-only stack: every old reservation URL forwards to /apply or /pay. */
export default function Layout() {
	return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07080B' } }} />;
}
