import { DocumentPickerAsset } from "expo-document-picker";
import { X } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import {
	FluentDocumentImage16Regular,
	FluentDocumentPdf32Filled,
	FluentDocumentSquare20Filled,
	FluentDocumentText28Filled,
	IconParkOutlineVideoTwo,
} from "../icons/i-document";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
	document: DocumentPickerAsset;
	index: number;
	onDelete?: (index: number) => void;
};

const ListDocument: React.FC<Props> = ({ document, index, onDelete }) => {
	const colors = useThemeColors();

	const Icon =
		document.mimeType === "application/pdf"
			? FluentDocumentPdf32Filled
			: document.mimeType?.includes("text")
				? FluentDocumentText28Filled
				: document.mimeType?.includes("image")
					? FluentDocumentImage16Regular
					: document.mimeType?.includes("video")
						? IconParkOutlineVideoTwo
						: FluentDocumentSquare20Filled;

	return (
		<View
			className="w-[150px] rounded-2xl p-2 h-16 relative"
			style={{ borderColor: hexToRgba(colors.text, 0.2), borderWidth: 1 }}
		>
			<View className="flex-row gap-2 items-center">
				<Icon size={30} color={colors.primary} />
				<ThemedText
					numberOfLines={2}
					style={{ fontSize: 12, maxWidth: 100 }}
					ellipsizeMode="tail"
				>
					{document.name}
				</ThemedText>
			</View>
			<Pressable
				onPress={() => onDelete?.(index)}
				className="w-6 h-6 items-center justify-center bg-white rounded absolute top-0 right-0"
			>
				<X color="#000000" size={12} />
			</Pressable>
		</View>
	);
};

export default ListDocument;
