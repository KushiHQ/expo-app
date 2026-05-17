import { useCountUp } from "@/lib/utils/animations";
import React from "react";
import { View } from "react-native";
import ThemedText from "./a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { TablerCurrencyNaira } from "../icons/i-currency";
import { LucideIcon, Info } from "lucide-react-native";
import Tooltip from "./a-tooltip";
import { twMerge } from "tailwind-merge";

type Props = {
	label: string;
	value: number;
	index: number;
	currency?: boolean;
	percentage?: boolean;
	description?: string;
	icon?: LucideIcon;
};

const AnalyticsCard: React.FC<Props> = ({
	label,
	value,
	index,
	currency,
	percentage,
	description,
	icon: Icon,
}) => {
	const colors = useThemeColors();
	const val = useCountUp({ targetNumber: value, duration: 1500 });

	return (
		<View
			style={{
				borderRadius: 24,
				backgroundColor: colors.surface,
				borderWidth: 1,
				borderColor: hexToRgba(colors.text, 0.05),
				shadowColor: colors.text,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.03,
				shadowRadius: 15,
				elevation: 1,
			}}
			className={twMerge(
				"flex-1 p-5 mb-2 gap-4",
				(index + 1) % 2 !== 0 && "mr-2",
			)}
		>
			<View className="flex-row items-start justify-between gap-2">
				<View className="flex-row items-center gap-1 flex-1">
					<ThemedText
						numberOfLines={2}
						style={{
							fontFamily: Fonts.semibold,
							fontSize: 13,
							flex: 1,
							lineHeight: 18,
							color: hexToRgba(colors.text, 0.5),
						}}
					>
						{label}
					</ThemedText>
					{description && (
						<Tooltip description={description}>
							<Info size={13} color={hexToRgba(colors.text, 0.3)} />
						</Tooltip>
					)}
				</View>
				{Icon && (
					<View
						style={{
							backgroundColor: hexToRgba(colors.primary, 0.1),
							padding: 8,
							borderRadius: 12,
						}}
					>
						<Icon size={18} color={colors.primary} />
					</View>
				)}
			</View>

			<View className="gap-1">
				<View className="flex-row items-center" style={{ flex: 1 }}>
					{currency && (
						<TablerCurrencyNaira
							color={colors.text}
							size={24}
							style={{ marginRight: -2, flexShrink: 0 }}
						/>
					)}
					<ThemedText
						numberOfLines={1}
						adjustsFontSizeToFit
						minimumFontScale={0.6}
						style={{
							fontFamily: Fonts.black,
							fontSize: 26,
							lineHeight: 34,
							letterSpacing: -1,
							flex: 1,
						}}
					>
						{val.toLocaleString()}
						{percentage && "%"}
					</ThemedText>
				</View>
			</View>
		</View>
	);
};

export default AnalyticsCard;
