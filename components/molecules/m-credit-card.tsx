import { ImageBackground } from "expo-image";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Dot } from "lucide-react-native";
import { LogosMastercard, MdiIntegratedCircuitChip } from "../icons/i-card";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { FlutterwaveCardPaymentMethodsQuery } from "@/lib/services/graphql/generated";

type Props = {
	card: FlutterwaveCardPaymentMethodsQuery["flutterwaveCardPaymentMethods"][number];
	selected?: boolean;
	onSelect?: (id: string) => void;
};

const CreditCard: React.FC<Props> = ({ selected, card, onSelect }) => {
	const colors = useThemeColors();

	return (
		<Pressable
			onPress={() => onSelect?.(card.id)}
			style={[
				{ padding: 6 },
				selected
					? {
						borderRadius: 26,
						borderColor: colors.primary,
						borderWidth: 2,
						padding: 4,
					}
					: {},
			]}
		>
			<View
				className="rounded-3xl overflow-hidden"
				style={{
					borderWidth: 1,
					borderColor: hexToRgba(colors.text, 0.1),
					...Platform.select({
						ios: {
							shadowColor: colors.primary,
							shadowOffset: { width: 0, height: -2 },
							shadowOpacity: 0.1,
							shadowRadius: 8,
						},
						android: {
							elevation: 10,
							shadowColor: hexToRgba(colors.text, 0.5),
						},
					}),
				}}
			>
				<ImageBackground source={require("@/assets/images/light-waves.jpg")}>
					<View className="items-center p-4 py-10 gap-6">
						<View className="items-center justify-between w-full px-2 flex-row">
							<MdiIntegratedCircuitChip color={"#cccccc"} size={50} />
							<LogosMastercard width={50} height={40} />
						</View>
						<View className="flex-row items-center">
							<ThemedText
								type="semibold"
								style={{ fontSize: 22, color: "white" }}
							>
								{card.first6}
							</ThemedText>
							<View className="flex-row items-center">
								{Array.from({ length: 12 }).map((_, index) => (
									<Dot color="white" key={index} />
								))}
							</View>
							<ThemedText
								type="semibold"
								style={{ fontSize: 22, color: "white" }}
							>
								{card.last4}
							</ThemedText>
						</View>
						<View className="flex-row items-center pt-4 px-2 justify-between w-full">
							<ThemedText
								numberOfLines={1}
								ellipsizeMode="tail"
								type="semibold"
								style={{ fontSize: 20, color: "white" }}
							>
								{card.cardHolderName}
							</ThemedText>
							<ThemedText
								type="semibold"
								style={{ fontSize: 20, color: "white" }}
							>
								{card.expiryMonth}/{card.expiryYear}
							</ThemedText>
						</View>
					</View>
				</ImageBackground>
			</View>
		</Pressable>
	);
};

export default CreditCard;
