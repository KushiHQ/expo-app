import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "../atoms/a-themed-view";
import React, { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { ChevronLeft, Share2Icon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

type Props = {
	children?: React.ReactNode;
	title?: string;
	footer?: React.ReactNode;
	withShare?: boolean;
	withProfile?: boolean;
};

const DetailsLayout: React.FC<Props> = ({
	children,
	title,
	footer,
	withShare,
	withProfile,
}) => {
	const router = useRouter();
	const colors = useThemeColors();
	const scrollViewRef = useRef<ScrollView>(null);

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
						<ThemedText>{title}</ThemedText>
					</View>
					<View className="flex-row items-center gap-3">
						{withShare && (
							<Pressable
								className="h-8 w-8 rounded-full justify-center items-center"
								style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
							>
								<Share2Icon size={24} color={colors.text} />
							</Pressable>
						)}
						{withProfile && (
							<View
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
							</View>
						)}
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
				{footer}
			</SafeAreaView>
		</ThemedView>
	);
};

export default DetailsLayout;
