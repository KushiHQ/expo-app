import React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { CheckboxChecked, CheckboxUnchecked } from "../icons/i-checkbox";
import { twMerge } from "tailwind-merge";
import * as Haptics from "expo-haptics";

type Props = {
	color?: string;
	size?: number;
	disabled?: boolean;
	checked?: boolean;
	style?: StyleProp<ViewStyle>;
	iconStyles?: StyleProp<ViewStyle>;
	onValueChange?: (checked: boolean) => void;
};

const Checkbox: React.FC<Props> = ({
	color,
	checked: defChecked,
	disabled,
	size,
	style,
	iconStyles,
	onValueChange,
}) => {
	const [checked, setChecked] = React.useState(defChecked ?? false);
	const checkedVal = defChecked !== undefined ? defChecked : checked;

	const toggleChecked = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (checkedVal) {
			onValueChange?.(false);
			setChecked(false);
		} else {
			onValueChange?.(true);
			setChecked(true);
		}
	};

	return (
		<Pressable
			disabled={disabled}
			className={twMerge("", disabled && "opacity-60")}
			style={style}
			onPress={toggleChecked}
		>
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
