import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import {
	Inter_100Thin,
	Inter_200ExtraLight,
	Inter_300Light,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	Inter_800ExtraBold,
	Inter_900Black,
	useFonts,
} from "@expo-google-fonts/inter";

import { useColorScheme } from "@/lib/hooks/use-color-scheme";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as JotaiProvider } from "jotai";
import { PaperProvider } from "react-native-paper";
import TansStackProvider from "@/components/providers/tanstack";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded, error] = useFonts({
		[Fonts.thin]: Inter_100Thin,
		[Fonts.extralight]: Inter_200ExtraLight,
		[Fonts.light]: Inter_300Light,
		[Fonts.regular]: Inter_400Regular,
		[Fonts.medium]: Inter_500Medium,
		[Fonts.semibold]: Inter_600SemiBold,
		[Fonts.bold]: Inter_700Bold,
		[Fonts.extrabold]: Inter_800ExtraBold,
		[Fonts.black]: Inter_900Black,
	});

	React.useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	if (!loaded && !error) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<KeyboardProvider>
				<TansStackProvider>
					<PaperProvider>
						<JotaiProvider>
							<SafeAreaProvider>
								<ThemeProvider
									value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
								>
									<Stack screenOptions={{ animation: "fade" }}>
										<Stack.Screen
											name="index"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="onboarding"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="auth"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="guest"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="hostings"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="chats"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="users"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="logout"
											options={{ headerShown: false }}
										/>
									</Stack>
									<StatusBar style="auto" />
								</ThemeProvider>
							</SafeAreaProvider>
						</JotaiProvider>
					</PaperProvider>
				</TansStackProvider>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}
