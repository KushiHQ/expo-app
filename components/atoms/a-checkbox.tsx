import React from "react";
import { Pressable } from "react-native";
import { CheckboxChecked, CheckboxUnchecked } from "../icons/i-checkbox";

type Props = {
	color?: string;
	size?: number;
	checked?: boolean;
	onValueChange?: (checked: boolean) => void;
};

const Checkbox: React.FC<Props> = ({
	color,
	checked: defChecked,
	size,
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
		<Pressable onPress={toggleChecked}>
			{checkedVal ? (
				<CheckboxChecked color={color} size={size} />
			) : (
				<CheckboxUnchecked color={color} size={size} />
			)}
		</Pressable>
	);
};

export default Checkbox;
