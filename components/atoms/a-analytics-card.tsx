import { useCountUp } from "@/lib/utils/animations";
import { ImageBackground } from "expo-image";
import React from "react";
import { View } from "react-native";
import ThemedText from "./a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { IcRoundPercent, TablerCurrencyNaira } from "../icons/i-currency";

type Props = {
	label: string;
	value: number;
	currency?: boolean;
	percentage?: boolean;
};

const AnalyticsCard: React.FC<Props> = ({
	label,
	value,
	currency,
	percentage,
}) => {
	const colors = useThemeColors();
	const val = useCountUp({ targetNumber: value, duration: 1000 });

	return (
		<View style={{ borderRadius: 12, overflow: "hidden" }} className="flex-1">
			<ImageBackground
				blurRadius={0.5}
				source={require("@/assets/images/logo.png")}
			>
				<View style={{ backgroundColor: hexToRgba(colors.background, 0.96) }}>
					<View
						className="p-4 pt-16 gap-1"
						style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
					>
						<ThemedText
							style={{ fontSize: 14, color: hexToRgba(colors.text, 0.8) }}
						>
							{label}
						</ThemedText>
						<View
							className="flex-row items-center"
							style={{
								transform: [{ translateX: currency || percentage ? -4 : 0 }],
							}}
						>
							{currency && (
								<TablerCurrencyNaira color={colors.text} size={24} />
							)}
							{percentage && <IcRoundPercent color={colors.text} size={24} />}
							<ThemedText style={{ fontFamily: Fonts.extrabold, fontSize: 20 }}>
								{val.toLocaleString()}
							</ThemedText>
						</View>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
};

export default AnalyticsCard;
