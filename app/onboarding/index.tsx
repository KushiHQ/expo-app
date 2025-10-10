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
							type="primary"
							onPress={() => router.push("/onboarding/get-started")}
						>
							<ThemedText content="primary">Get Started</ThemedText>
						</Button>
						<Button type="shade" onPress={() => router.push("/auth/sign-up")}>
							<ThemedText content="shade">Sign up / Login</ThemedText>
						</Button>
						<Button onPress={() => router.push("/guest/home")} type="tinted">
							<ThemedText content="tinted">Explore</ThemedText>
						</Button>
					</View>
				</View>
			</SafeAreaView>
		</ThemedView>
	);
}
