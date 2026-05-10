import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "../atoms/a-themed-view";
import React from "react";
import { View } from "react-native";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import Logo from "../icons/i-logo";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import BackButton from "../atoms/a-backbutton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";

type Props = {
	title?: string;
	description?: string;
	children?: React.ReactNode;
};

const AuthLayout: React.FC<Props> = ({ title, description, children }) => {
	const router = useRouter();
	const colors = useThemeColors();
	const { isTablet } = useBreakpoint();

	return (
		<ThemedView className="flex-1">
			<SafeAreaView className="flex-1">
			<View style={{ flex: 1, width: "100%", maxWidth: isTablet ? 480 : undefined, alignSelf: "center" }}>
				<KeyboardAwareScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="p-5 flex-1">
						<BackButton onPress={() => router.back()} className="top-5" />
						<View className="gap-9 mt-28">
							<View
								className="border items-center justify-center rounded-xl"
								style={{
									borderColor: hexToRgba(colors["text"], 0.15),
									width: 48,
									height: 48,
								}}
							>
								<Logo width={32} height={29} />
							</View>
							<View className="gap-4">
								<ThemedText
									style={{ fontFamily: Fonts.bold, fontSize: 28 }}
									type="title"
								>
									{title}
								</ThemedText>
								<ThemedText style={{ color: hexToRgba(colors["text"], 0.7) }}>
									{description}
								</ThemedText>
							</View>
						</View>
						<View className="flex-1">{children}</View>
					</View>
				</KeyboardAwareScrollView>
			</View>
			</SafeAreaView>
		</ThemedView>
	);
};

export default AuthLayout;
