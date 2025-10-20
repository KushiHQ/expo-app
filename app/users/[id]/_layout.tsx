import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="profile" options={{ headerShown: false }} />
			<Stack.Screen name="bookings" options={{ headerShown: false }} />
			<Stack.Screen name="notifications" options={{ headerShown: false }} />
			<Stack.Screen name="security" options={{ headerShown: false }} />
			<Stack.Screen name="update-password" options={{ headerShown: false }} />
			<Stack.Screen name="change-pin" options={{ headerShown: false }} />
		</Stack>
	);
}
