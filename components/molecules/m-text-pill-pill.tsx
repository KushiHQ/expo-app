import { Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";
import { IconType } from "@/lib/types/enums/hosting-icons";
import { capitalize } from "@/lib/utils/text";
import { Fonts } from "@/lib/constants/theme";

type Props = {
	selected?: boolean;
	onSelect?: (value: string) => void;
	children: string;
	icon?: IconType;
};

const TextPill: React.FC<Props> = ({ icon, children, selected, onSelect }) => {
	const colors = useThemeColors();
	const Icon = icon;

	return (
		<Pressable
			className="flex-row items-center gap-2.5 py-2.5 px-5 rounded-2xl"
			style={{
				backgroundColor: selected ? colors.primary : colors["surface-01"],
				borderWidth: 1,
				borderColor: selected ? colors.primary : hexToRgba(colors.text, 0.05),
				shadowColor: selected ? colors.primary : "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: selected ? 0.2 : 0,
				shadowRadius: 8,
				elevation: selected ? 4 : 0,
			}}
			onPress={() => onSelect?.(children)}
		>
			{Icon && (
				<Icon
					size={16}
					color={selected ? "#fff" : hexToRgba(colors.text, 0.7)}
				/>
			)}
			<ThemedText
				className="whitespace-nowrap"
				style={{
					fontSize: 13,
					fontFamily: selected ? Fonts.semibold : Fonts.medium,
					color: selected ? "#fff" : hexToRgba(colors.text, 0.8),
				}}
			>
				{capitalize(children.replaceAll("_", " "))}
			</ThemedText>
		</Pressable>
	);
};

export default TextPill;
