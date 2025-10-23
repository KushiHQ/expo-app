import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
	return (
		<Stack screenOptions={{ animation: "fade" }}>
			<Stack.Screen name="[id]" options={{ headerShown: false }} />
			<Stack.Screen name="form" options={{ headerShown: false }} />
			<Stack.Screen name="map" options={{ headerShown: false }} />
		</Stack>
	);
}
