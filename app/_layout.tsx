import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
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
import GraphqlClientProvider from "@/components/providers/graphql-client";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/atoms/a-toast";
import { NotificationProvider } from "@/components/contexts/notifications";
import StreamVideoClientProvider from "@/components/providers/stream-video-client";
import { initializeNotifications } from "@/lib/utils/notifications";
import { LogBox } from "react-native";

SplashScreen.preventAutoHideAsync();

configureReanimatedLogger({
	level: ReanimatedLogLevel.error,
	strict: false,
});

LogBox.ignoreLogs([
	"AddIceCandidate failed because the session was shut down",
	"Illegal State: call.join() shall be called only once",
	"The screen 'index' was removed natively but didn't get removed from JS state",
]);

initializeNotifications();

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
		TwemojiMozilla: require("react-native-country-select/lib/assets/fonts/TwemojiMozilla.woff2"),
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
		<>
			<GraphqlClientProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<KeyboardProvider>
						<TansStackProvider>
							<PaperProvider>
								<JotaiProvider>
									<SafeAreaProvider>
										<NotificationProvider>
											<StreamVideoClientProvider>
												<ThemeProvider
													value={
														colorScheme === "dark" ? DarkTheme : DefaultTheme
													}
												>
													<Stack screenOptions={{ animation: "fade" }}>
														<Stack.Screen
															name="index"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="+not-found"
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
															name="host"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="camera"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="photo-gallery"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="hostings"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="kyc"
															options={{ headerShown: false }}
														/>
														<Stack.Screen
															name="bookings"
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
											</StreamVideoClientProvider>
										</NotificationProvider>
									</SafeAreaProvider>
								</JotaiProvider>
							</PaperProvider>
						</TansStackProvider>
					</KeyboardProvider>
				</GestureHandlerRootView>
			</GraphqlClientProvider>
			<Toast config={toastConfig} />
		</>
	);
}
