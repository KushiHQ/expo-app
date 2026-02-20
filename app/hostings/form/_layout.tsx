import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="onboarding" options={{ headerShown: false }} />
			<Stack.Screen name="step-1" options={{ headerShown: false }} />
			<Stack.Screen name="step-2" options={{ headerShown: false }} />
			<Stack.Screen name="step-3" options={{ headerShown: false }} />
			<Stack.Screen name="step-4" options={{ headerShown: false }} />
			<Stack.Screen name="step-5" options={{ headerShown: false }} />
			<Stack.Screen name="step-6" options={{ headerShown: false }} />
			<Stack.Screen name="step-7" options={{ headerShown: false }} />
		</Stack>
	);
}
