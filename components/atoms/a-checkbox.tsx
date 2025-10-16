import React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { CheckboxChecked, CheckboxUnchecked } from "../icons/i-checkbox";

type Props = {
	color?: string;
	size?: number;
	checked?: boolean;
	style?: StyleProp<ViewStyle>;
	iconStyles?: StyleProp<ViewStyle>;
	onValueChange?: (checked: boolean) => void;
};

const Checkbox: React.FC<Props> = ({
	color,
	checked: defChecked,
	size,
	style,
	iconStyles,
	onValueChange,
}) => {
	const [checked, setChecked] = React.useState(defChecked ?? false);
	const checkedVal = defChecked !== undefined ? defChecked : checked;

	const toggleChecked = () => {
		if (checked) {
			onValueChange?.(false);
			setChecked(false);
		} else {
			onValueChange?.(true);
			setChecked(true);
		}
	};

	return (
		<Pressable style={style} onPress={toggleChecked}>
			<View style={iconStyles}>
				{checkedVal ? (
					<CheckboxChecked color={color} size={size} />
				) : (
					<CheckboxUnchecked color={color} size={size} />
				)}
			</View>
		</Pressable>
	);
};

export default Checkbox;
