import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "../atoms/a-themed-view";
import React, { useRef, useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { ChevronLeft } from "lucide-react-native";
import { IonNotificationsOutline } from "../icons/i-notifications";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { EventEmitter } from "@/lib/utils/event-emitter";
import { useUserStore } from "@/lib/stores/users";

type Props = {
	children?: React.ReactNode;
};

const ProfileLayout: React.FC<Props> = ({ children }) => {
	const colors = useThemeColors();
	const router = useRouter();
	const scrollViewRef = useRef<ScrollView>(null);
	const path = usePathname();
	const user = useUserStore((c) => c.user);

	useEffect(() => {
		const handleScrollToTop = () => {
			scrollViewRef.current?.scrollTo({ y: 0, animated: true });
		};

		const routeName = path.split("/").pop();

		EventEmitter.on(`scrollToTop:${routeName}`, handleScrollToTop);

		return () => {
			EventEmitter.off(`scrollToTop:${routeName}`, handleScrollToTop);
		};
	}, [path]);

	return (
		<ThemedView className="flex-1">
			<SafeAreaView className="flex-1">
				<View className="p-5 flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<Pressable
							onPress={() => router.back()}
							aria-label="Go Back"
							className="w-8 items-center justify-center rounded-full h-8"
							style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
						>
							<ChevronLeft color={colors["text"]} />
						</Pressable>
						<View>
							<ThemedText>{user.user?.profile.fullName}</ThemedText>
							<ThemedText
								style={{
									fontSize: 12,
									color: hexToRgba(colors["text"], 0.7),
								}}
							>
								Find your perfect home
							</ThemedText>
						</View>
					</View>
					<View className="flex-row items-center gap-3">
						<Pressable onPress={() => router.push("/users/notifications")}>
							<IonNotificationsOutline color={hexToRgba(colors["text"], 0.7)} />
						</Pressable>
						<Pressable
							onPress={() => router.push("/guest/profile")}
							className="w-8 h-8 rounded-full border overflow-hidden"
							style={{
								borderColor: hexToRgba(colors["text"], 0.6),
								borderWidth: 2,
							}}
						>
							<Image
								style={{
									height: "100%",
									width: "100%",
									objectFit: "cover",
								}}
								source={{
									uri: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk",
								}}
							/>
						</Pressable>
					</View>
				</View>
				<ScrollView
					ref={scrollViewRef}
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="p-5 pt-0 flex-1">
						<View className="flex-1">{children}</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</ThemedView>
	);
};

export default ProfileLayout;
