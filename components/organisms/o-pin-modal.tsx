import React from "react";
import BottomSheet from "../atoms/a-bottom-sheet";
import { Image } from "expo-image";
import { View } from "react-native";
import OTPInput from "../atoms/a-otp-input";
import ThemedText from "../atoms/a-themed-text";
import Button from "../atoms/a-button";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
	open: boolean;
	label?: string;
	description?: string;
	length: number;
	onClose: () => void;
	onSubmit?: (pin: string) => void;
};

const PINModal: React.FC<Props> = ({
	open,
	label,
	description,
	onClose,
	length,
	onSubmit,
}) => {
	const colors = useThemeColors();
	const [pin, setPin] = React.useState("");

	return (
		<BottomSheet isVisible={open} onClose={onClose}>
			<View className="items-center gap-4">
				<View className="items-center">
					{label && (
						<ThemedText className="mt-4" type="subtitle">
							{label}
						</ThemedText>
					)}
					{description && (
						<ThemedText style={{ color: hexToRgba(colors.text, 0.7) }}>
							{description}
						</ThemedText>
					)}
				</View>
				<Image
					style={{
						width: 160,
						height: 160,
						objectFit: "cover",
					}}
					source={require("@/assets/images/security-shield.png")}
				/>
				<View className="items-center gap-2">
					<OTPInput onChangeText={setPin} length={length} />
				</View>
				<View className="flex-row gap-4 my-8">
					<Button
						onPress={onClose}
						className="flex-1"
						variant="outline"
						type="primary"
					>
						<ThemedText content="tinted">Cancel</ThemedText>
					</Button>
					<Button
						className="flex-1"
						type="primary"
						onPress={() => onSubmit?.(pin)}
					>
						<ThemedText content="primary">Submit</ThemedText>
					</Button>
				</View>
			</View>
		</BottomSheet>
	);
};

export default PINModal;
