import React from "react";
import { FloatingLabelInputProps } from "../atoms/a-floating-label-input";
import BottomSheet from "../atoms/a-bottom-sheet";
import {
	Dimensions,
	FlatList,
	GestureResponderEvent,
	ListRenderItem,
	Pressable,
	View,
} from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { ChevronDown, CircleQuestionMark } from "lucide-react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import SearchInput from "../atoms/a-search-input";
import { cast } from "@/lib/types/utils";
import EmptyList from "./m-empty-list";
import { capitalize } from "@/lib/utils/text";
import Checkbox from "../atoms/a-checkbox";
import Tooltip from "../atoms/a-tooltip";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const LIST_MAX_HEIGHT = SCREEN_HEIGHT * 0.45;
export type SelectionDetails = { selected?: boolean };

interface BaseProps<T> extends Omit<FloatingLabelInputProps, "defaultValue"> {
	defaultValue?: T;
	getValueString?: (value: T) => string;
	selectedValueString?: string;
	options: T[];
	onSelect?: (v: T) => void;
	getLabelString?: (v?: T) => string;
	footer?: React.ReactNode;
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

const getValueString = (value: any) => {
	if (typeof value === "object") {
		return cast<Record<string, any>>(value).value;
	} else {
		return value;
	}
};

const getLabelString = (value: any) => {
	if (typeof value === "object") {
		return cast<Record<string, any>>(value).label;
	} else {
		return value;
	}
};

const SelectInput = <T extends object>(props: Props<T>) => {
	const { options, renderItem: RenderItem, onSelect, ...rest } = props;
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState(props.defaultValue);
	const [search, setSearch] = React.useState("");
	const colors = useThemeColors();
	const valueStringFunc = props.getValueString ?? getValueString;
	const selectedValue = React.useMemo(
		() => valueStringFunc(cast(value)),
		[value, valueStringFunc],
	);
	const selectedLabel = React.useMemo(
		() => (props.getLabelString ?? getLabelString)(value),
		[value, getLabelString, props.getLabelString],
	);

	const filtered = React.useMemo(() => {
		let result = options;

		if (rest.searchable && search) {
			result = options.filter((v) =>
				String(cast<Record<string, string>>(v)[rest.searchField])
					.toLowerCase()
					.includes(search.toLowerCase()),
			);
		}

		return [...result].sort((a, b) => {
			const fieldA = rest.searchable
				? String(cast<Record<string, string>>(a)[rest.searchField])
				: valueStringFunc(a);
			const fieldB = rest.searchable
				? String(cast<Record<string, string>>(b)[rest.searchField])
				: valueStringFunc(b);

			if ((a as any).sequence && (b as any).sequence) {
				return (a as any).sequence - (b as any).sequence;
			}

			return fieldA.localeCompare(fieldB);
		});
	}, [rest, search, options, valueStringFunc]);

	React.useEffect(() => {
		if (props.defaultValue && !value) {
			setValue(props.defaultValue);
		}
	}, [props.defaultValue, value]);

	const handlePress = (e: GestureResponderEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setOpen(true);
	};

	const renderListOption: ListRenderItem<T> = React.useCallback(
		({ item }) => {
			const isSelected =
				String(selectedValue).toLowerCase() ===
				String(valueStringFunc(item)).toLowerCase();

			return (
				<Pressable
					className="py-2"
					onPress={() => {
						setValue(item);
						onSelect?.(item);
						setOpen(false);
						setSearch("");
					}}
				>
					<RenderItem {...item} selected={isSelected} />
				</Pressable>
			);
		},
		[selectedValue, valueStringFunc, onSelect, RenderItem],
	);

	return (
		<>
			<View className="flex-1 relative">
				<Pressable
					onPress={handlePress}
					className="border p-3.5 rounded-xl relative"
					style={{
						borderColor: hexToRgba(colors.text, 0.3),
						backgroundColor: hexToRgba(colors.text, 0.05),
					}}
				>
					<View className="absolute top-1.5 flex-row gap-5">
						<ThemedText style={{ fontSize: 12, left: 13 }}>
							{props.label}
						</ThemedText>
						{rest.description && (
							<Tooltip
								title={rest.label}
								description={rest.description}
								className="mt-[3px]"
							>
								<CircleQuestionMark
									color={hexToRgba(colors.text, 0.7)}
									size={14}
								/>
							</Tooltip>
						)}
					</View>
					<View className="flex-row mt-3 justify-between items-center">
						<ThemedText
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{
								fontSize: 14,
								maxWidth: "80%",
								color: !value ? hexToRgba(colors.text, 0.4) : colors.text,
							}}
						>
							{props.selectedValueString ??
								capitalize(selectedLabel ?? rest.placeholder ?? "")}
						</ThemedText>
						<ChevronDown color={hexToRgba(colors.text, 0.4)} />
					</View>
				</Pressable>
			</View>

			<BottomSheet
				scrollable={false}
				isVisible={open}
				onClose={() => setOpen(false)}
			>
				<View style={{ paddingBottom: 20 }}>
					<ThemedText type="semibold" className="mb-4">
						{props.label}
					</ThemedText>

					{rest.searchable && (
						<View className="mb-4">
							<SearchInput
								value={search}
								onChangeText={setSearch}
								placeholder="Search..."
							/>
						</View>
					)}

					<View style={{ maxHeight: LIST_MAX_HEIGHT }}>
						<FlatList
							data={filtered}
							renderItem={renderListOption}
							keyExtractor={(item, index) => {
								return (
									(item as any).id || (item as any).code || index.toString()
								);
							}}
							initialNumToRender={10}
							maxToRenderPerBatch={10}
							windowSize={5}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={<EmptyList message="No items found" />}
							keyboardShouldPersistTaps="handled"
						/>
					</View>
					{props.footer}
				</View>
			</BottomSheet>
		</>
	);
};

export default SelectInput;

export type SelectOptionType = {
	label: string;
	description?: string;
	value: string;
};

export const SelectOption: React.FC<SelectOptionType & SelectionDetails> = ({
	label,
	description,
	selected,
}) => {
	const colors = useThemeColors();

	return (
		<View
			className="flex-row items-center justify-between border p-2 rounded-md pl-4"
			style={{
				borderColor: hexToRgba(
					selected ? colors.primary : colors.text,
					selected ? 0.5 : 0.2,
				),
				backgroundColor: hexToRgba(
					selected ? colors.primary : colors.text,
					selected ? 0.2 : 0.1,
				),
			}}
		>
			<View className="flex-row gap-2 items-center">
				<ThemedText numberOfLines={1} ellipsizeMode="tail">
					{capitalize(label)}
				</ThemedText>
				{description && (
					<Tooltip title={label} description={description}>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
					</Tooltip>
				)}
			</View>
			<Checkbox
				color={selected ? colors.primary : hexToRgba(colors.text, 0.6)}
				checked={selected}
			/>
		</View>
	);
};
