import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="step-1" options={{ headerShown: false }} />
			<Stack.Screen name="step-2" options={{ headerShown: false }} />
			<Stack.Screen name="step-3" options={{ headerShown: false }} />
		</Stack>
	);
}
