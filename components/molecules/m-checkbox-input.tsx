import { Pressable, View } from "react-native";
import Checkbox from "../atoms/a-checkbox";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import React from "react";

type Props = {
	checked?: boolean;
	onCheckChange?: (v: boolean) => void;
	children?: React.ReactNode;
};

const CheckboxInput: React.FC<Props> = ({
	checked: defChecked,
	onCheckChange,
	children,
}) => {
	const [checked, setChecked] = React.useState(defChecked);
	const colors = useThemeColors();

	const handleCheckChange = () => {
		onCheckChange?.(!checked);
		setChecked(!checked);
	};

	return (
		<Pressable
			onPress={handleCheckChange}
			className="flex-row items-start gap-2"
		>
			<View className="pt-0.5">
				<Checkbox
					color={colors.primary}
					size={20}
					checked={checked}
					onValueChange={handleCheckChange}
				/>
			</View>
			<View className="flex-1">{children}</View>
		</Pressable>
	);
};

export default CheckboxInput;
