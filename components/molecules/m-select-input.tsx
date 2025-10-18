import React from "react";
import FloatingLabelInput, {
	FloatingLabelInputProps,
} from "../atoms/a-floating-label-input";
import BottomSheet from "../atoms/a-bottom-sheet";
import { GestureResponderEvent, Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { CarbonCircleFilled, CarbonCircleOutline } from "../icons/i-circle";
import { ChevronDown } from "lucide-react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type SelectionDetails = { selected?: boolean };

interface Props<T> extends FloatingLabelInputProps {
	options: T[];
	onSelect?: (v: T) => void;
	renderItem: React.FC<T & SelectionDetails>;
}

const SelectInput = <T extends {}>(props: Props<T>) => {
	const { options, renderItem: RenderItem, onSelect, ...rest } = props;
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<T>();
	const colors = useThemeColors();

	const handlePress = (e: GestureResponderEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setOpen(true);
	};

	return (
		<>
			<View className="flex-1">
				<FloatingLabelInput
					{...rest}
					disabled
					onPress={handlePress}
					pointerEvents="none"
					value={props.value}
					suffix={<ChevronDown color={hexToRgba(colors.text, 0.4)} />}
				/>
			</View>
			<BottomSheet isVisible={open} onClose={() => setOpen(false)}>
				<View className="gap-4">
					<ThemedText type="semibold">{props.label}</ThemedText>
					<View>
						{options.map((v, index) => (
							<Pressable
								className="p-2"
								onPress={() => {
									setValue(v);
									onSelect?.(v);
									setOpen(false);
								}}
								key={index}
							>
								<RenderItem {...v} selected={value === v} />
							</Pressable>
						))}
					</View>
				</View>
			</BottomSheet>
		</>
	);
};

export default SelectInput;

export type SelectOption = {
	label: string;
	value: string;
};

export const SelectOption: React.FC<SelectOption & SelectionDetails> = ({
	label,
	selected,
}) => {
	const colors = useThemeColors();

	return (
		<View className="flex-row items-center justify-between">
			<ThemedText>{label}</ThemedText>
			{selected ? (
				<CarbonCircleFilled size={16} color={colors.primary} />
			) : (
				<CarbonCircleOutline size={16} color={colors.primary} />
			)}
		</View>
	);
};
