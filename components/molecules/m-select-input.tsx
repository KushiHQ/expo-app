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
import SearchInput from "../atoms/a-search-input";
import { cast } from "@/lib/types/utils";

export type SelectionDetails = { selected?: boolean };

interface BaseProps<T> extends FloatingLabelInputProps {
	options: T[];
	onSelect?: (v: T) => void;
	renderItem: React.FC<T & SelectionDetails>;
}

type WithoutSearch<T> = BaseProps<T> & {
	searchable?: false;
};

type WithSearch<T> = BaseProps<T> & {
	searchable?: true;
	searchField: string;
};

type Props<T> = WithSearch<T> | WithoutSearch<T>;

const SelectInput = <T extends {}>(props: Props<T>) => {
	const { options, renderItem: RenderItem, onSelect, ...rest } = props;
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState<T>();
	const [search, setSearch] = React.useState("");
	const colors = useThemeColors();

	const filtered = rest.searchable
		? options.filter((v) =>
				String(cast<Record<string, string>>(v)[rest.searchField])
					.toLowerCase()
					.includes(search.toLowerCase()),
			)
		: options;

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
						{rest.searchable && (
							<View className="mb-4">
								<SearchInput
									value={search}
									onChangeText={setSearch}
									placeholder="Search..."
								/>
							</View>
						)}
						{filtered.map((v, index) => (
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
