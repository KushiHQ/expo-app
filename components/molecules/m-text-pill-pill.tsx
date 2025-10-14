import { Pressable } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";
import { IconType } from "@/lib/types/enums/hosting-icons";

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
			className="border flex-row items-center gap-2 p-1 px-3 rounded-full"
			style={{
				backgroundColor: selected ? colors["text"] : colors["background"],
				borderColor: hexToRgba(colors["shade"], 0.9),
			}}
			onPress={() => onSelect?.(children)}
		>
			{Icon && (
				<Icon
					size={16}
					color={hexToRgba(
						selected ? colors["background"] : colors["text"],
						0.9,
					)}
				/>
			)}
			<ThemedText
				style={{
					fontSize: 14,
					color: hexToRgba(
						selected ? colors["background"] : colors["text"],
						0.9,
					),
				}}
			>
				{children}
			</ThemedText>
		</Pressable>
	);
};

export default TextPill;
