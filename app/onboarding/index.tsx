import ThemedText from "@/components/atoms/a-themed-text";
import ThemedView from "@/components/atoms/a-themed-view";
import { View } from "react-native";
import LogoLarge from "@/assets/vectors/logo-large.svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import Button from "@/components/atoms/a-button";
import { useRouter } from "expo-router";

export default function Welcome() {
	const colors = useThemeColors();
	const router = useRouter();

	return (
		<ThemedView style={{ flex: 1 }}>
			<SafeAreaView className="flex-1 items-center justify-center">
				<View className="gap-40">
					<View className="items-center gap-2">
						<View style={{ flexDirection: "row", gap: 4 }}>
							<ThemedText type="title" style={{ color: colors["primary"] }}>
								Welcome to
							</ThemedText>
							<LogoLarge />
						</View>
						<ThemedText
							type="subtitle"
							style={{ color: hexToRgba(colors["text"], 0.7) }}
						>
							Your perfect home, just a few taps away
						</ThemedText>
					</View>
					<View className="gap-3">
						<Button
							onPress={() => router.push("/onboarding/get-started")}
							style={{ backgroundColor: colors["primary"] }}
						>
							<ThemedText style={{ color: colors["primary-content"] }}>
								Get Started
							</ThemedText>
						</Button>
						<Button style={{ backgroundColor: colors["shade"] }}>
							<ThemedText style={{ color: colors["shade-content"] }}>
								Sign up / Login
							</ThemedText>
						</Button>
						<Button
							style={{ backgroundColor: hexToRgba(colors["primary"], 0.15) }}
						>
							<ThemedText style={{ color: colors["primary"] }}>
								Explore
							</ThemedText>
						</Button>
					</View>
				</View>
			</SafeAreaView>
		</ThemedView>
	);
}
