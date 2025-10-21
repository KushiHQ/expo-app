import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="[id]" options={{ headerShown: false }} />
			<Stack.Screen name="new" options={{ headerShown: false }} />
		</Stack>
	);
}
