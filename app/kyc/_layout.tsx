import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="image" options={{ headerShown: false }} />
			<Stack.Screen name="nin" options={{ headerShown: false }} />
			<Stack.Screen name="bvn" options={{ headerShown: false }} />
		</Stack>
	);
}
