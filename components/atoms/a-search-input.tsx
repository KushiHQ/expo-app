import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { TextInput, View } from "react-native";
import { LineiconsSearch1 } from "../icons/i-search";

type Props = {
	value?: string;
	onChangeText?: (text: string) => void;
	placeholder?: string;
};

const SearchInput: React.FC<Props> = ({ value, onChangeText, placeholder }) => {
	const colors = useThemeColors();

	return (
		<View
			className="flex-row items-center gap-2 px-3 rounded-full"
			style={{
				backgroundColor: hexToRgba(colors.text, 0.1),
			}}
		>
			<LineiconsSearch1 color={hexToRgba(colors.text, 0.2)} />
			<TextInput
				value={value}
				cursorColor={colors.primary}
				className="flex-1"
				onChangeText={onChangeText}
				placeholderTextColor={hexToRgba(colors.text, 0.2)}
				style={{
					fontSize: 16,
					color: colors.text,
				}}
				placeholder={placeholder}
			/>
		</View>
	);
};

export default SearchInput;
