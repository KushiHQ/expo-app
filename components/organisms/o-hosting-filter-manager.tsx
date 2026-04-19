import {
	Keyboard,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { LineiconsSearch1 } from "../icons/i-search";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { JamSettingsAlt } from "../icons/i-settings";
import { MaterialSymbolsLightMapOutlineRounded } from "../icons/i-map";
import BottomSheet from "../atoms/a-bottom-sheet";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { Fonts } from "@/lib/constants/theme";
import { FACILITIES_BY_VARIANT } from "@/lib/types/enums/hostings";
import TextPill from "../molecules/m-text-pill-pill";
import RangeSlider from "../atoms/a-range-slider";
import FloatingLabelInput from "../atoms/a-floating-label-input";
import { LayoutList, MapPin, Sparkles, X } from "lucide-react-native";
import LocationSelectInput, {
	SelectedLocation,
} from "../molecules/m-location-select-input";
import RatingPill from "../molecules/m-rating-pill";
import Button from "../atoms/a-button";
import { HotingVariantFilter } from "../molecules/m-hosting-variant-filter";
import {
	FACILITY_ICONS,
	FALLBACK_FACILITY_ICON,
} from "@/lib/types/enums/hosting-icons";
import { cast } from "@/lib/types/utils";
import { useHostingFilterStore } from "@/lib/stores/hostings";

import Animated, { LinearTransition } from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import {
	AiHostingSearchPredictionsQuery,
	useAiHostingSearchPredictionsQuery,
} from "@/lib/services/graphql/generated";
import Skeleton from "../atoms/a-skeleton";
import { useRouter } from "expo-router";

type Props = {
	isMapView?: boolean;
};

const HostingFilterManager: React.FC<Props> = ({ isMapView }) => {
	const router = useRouter();
	const [variant, setVariant] = React.useState("All");
	const [facilities, setFacilities] = React.useState(["All"]);
	const [filterOpen, setFilterOpen] = React.useState(false);
	const [locationInputOpen, setLocationInputOpen] = React.useState(false);
	const [selectedLocation, setSelectedLocation] =
		React.useState<SelectedLocation>();

	const [searchInput, setSearchInput] = React.useState("");
	const [{ fetching, data }] = useAiHostingSearchPredictionsQuery({
		variables: {
			userInput: searchInput,
		},
	});

	const [isInputFocused, setIsInputFocused] = React.useState(false);

	const colors = useThemeColors();
	const { filter, updateFilter, resetFilter } = useHostingFilterStore();

	function handleApply() {
		setFilterOpen(false);
	}

	function handleReset() {
		resetFilter();
		setVariant("All");
		setFacilities(["All"]);
		setSelectedLocation(undefined);
	}

	function handleSelectPrediction(
		predictionFilters: AiHostingSearchPredictionsQuery["aiHostingSearchPredictions"][number]["filters"],
	) {
		console.log("Updating", predictionFilters);
		updateFilter({
			city: predictionFilters.city,
			state: predictionFilters.state,
			country: predictionFilters.country,
			minPrice: predictionFilters.minPrice
				? Number(predictionFilters.minPrice)
				: undefined,
			maxPrice: predictionFilters.maxPrice
				? Number(predictionFilters.maxPrice)
				: undefined,
		});
		Keyboard.dismiss();
	}

	React.useEffect(() => {
		updateFilter({
			facilities: facilities.includes("All") ? undefined : facilities,
		});
	}, [facilities, updateFilter]);

	const handleToggleView = () => {
		if (isMapView) {
			router.back();
		} else {
			router.push("/hostings/map");
		}
	};

	return (
		<View style={{ zIndex: 50 }}>
			<Animated.View
				layout={LinearTransition.springify().damping(25).stiffness(300)}
				className={`flex-row gap-2 px-4 rounded-[24px] ${
					isInputFocused
						? "items-start py-4 min-h-[120px]"
						: "items-center py-2 min-h-[50px]"
				}`}
				style={{
					backgroundColor: isMapView
						? colors.background
						: hexToRgba(colors["text"], 0.1),
					borderWidth: isMapView ? 1 : 0,
					borderColor: hexToRgba(colors.text, 0.1),
					shadowColor: isMapView ? "#000" : "transparent",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: isMapView ? 0.1 : 0,
					shadowRadius: 4,
					elevation: isMapView ? 3 : 0,
				}}
			>
				<View
					className="flex-row flex-1 gap-2"
					style={{ alignItems: isInputFocused ? "flex-start" : "center" }}
				>
					{JSON.stringify(filter).length > 5 ? (
						<Pressable
							onPress={() => {
								setSearchInput("");
								resetFilter();
							}}
							aria-label="Clear filters"
							style={{ marginTop: isInputFocused ? 2 : 0 }}
						>
							<X color={hexToRgba(colors.error, 0.9)} />
						</Pressable>
					) : (
						<View style={{ marginTop: isInputFocused ? 4 : 0 }}>
							<LineiconsSearch1 color={hexToRgba(colors["text"], 0.5)} />
						</View>
					)}

					<TextInput
						value={searchInput}
						cursorColor={colors.primary}
						className={twMerge("flex-1", isInputFocused && "pt-1.5")}
						placeholderClassName="text-ellipsis"
						style={{ color: colors["text"], fontSize: 14 }}
						placeholderTextColor={hexToRgba(colors["text"], 0.5)}
						placeholder="Enter location, price, property type, pr..."
						onChangeText={setSearchInput}
						multiline={true}
						numberOfLines={4}
						onFocus={() => setIsInputFocused(true)}
						onBlur={() => setIsInputFocused(false)}
						textAlignVertical={isInputFocused ? "top" : "center"}
					/>
				</View>

				<View
					className="flex-row items-center gap-2"
					style={{ marginTop: isInputFocused ? 2 : 0 }}
				>
					<Pressable
						onPress={() => {
							setFilterOpen((c) => !c);
						}}
					>
						<JamSettingsAlt color={hexToRgba(colors["text"], 0.5)} />
					</Pressable>
					<TouchableOpacity
						onPress={handleToggleView}
						style={{ backgroundColor: colors["text"], height: 32, width: 32 }}
						className="items-center justify-center rounded-full"
					>
						{isMapView ? (
							<LayoutList color={colors.background} size={18} />
						) : (
							<MaterialSymbolsLightMapOutlineRounded
								color={colors["background"]}
								size={20}
							/>
						)}
					</TouchableOpacity>
				</View>
			</Animated.View>

			{searchInput.length > 5 && (
				<View
					className="absolute left-0 right-0 rounded-[20px] overflow-hidden border mt-2 shadow-lg"
					style={{
						top: "100%",
						backgroundColor: colors.background,
						borderColor: hexToRgba(colors.text, 0.1),
						maxHeight: 300,
					}}
				>
					{fetching ? (
						<View className="items-center justify-center">
							{Array.from({ length: 3 }).map((_, index) => (
								<View
									key={index}
									className="flex-row items-center gap-4 p-4 border-b"
									style={{ borderBottomColor: hexToRgba(colors.text, 0.05) }}
								>
									<Skeleton
										style={{ width: 38, height: 38, borderRadius: 12 }}
									/>
									<View className="flex-1 gap-2">
										<Skeleton style={{ width: "70%", height: 20 }} />
										<Skeleton style={{ width: "90%", height: 15 }} />
									</View>
								</View>
							))}
						</View>
					) : (
						<ScrollView keyboardShouldPersistTaps="handled">
							{data?.aiHostingSearchPredictions?.map((prediction, idx) => (
								<Pressable
									key={idx}
									onPress={() => handleSelectPrediction(prediction.filters)}
									className="flex-row items-center gap-4 p-4 border-b"
									style={{ borderBottomColor: hexToRgba(colors.text, 0.05) }}
								>
									<View
										style={{
											backgroundColor: hexToRgba(colors.primary, 0.1),
											padding: 10,
											borderRadius: 12,
										}}
									>
										<Sparkles color={colors.primary} size={20} />
									</View>
									<View className="flex-1 gap-1">
										<ThemedText type="semibold" numberOfLines={1}>
											{prediction.summary}
										</ThemedText>
										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
											className="flex-row gap-2 mt-1"
										>
											{prediction.filters.city && (
												<FilterTag
													label="City"
													value={prediction.filters.city}
													colors={colors}
												/>
											)}
											{prediction.filters.state && (
												<FilterTag
													label="State"
													value={prediction.filters.state}
													colors={colors}
												/>
											)}
											{prediction.filters.country && (
												<FilterTag
													label="Country"
													value={prediction.filters.country}
													colors={colors}
												/>
											)}
											{prediction.filters.maxPrice && (
												<FilterTag
													label="Max"
													value={`₦${Number(prediction.filters.maxPrice).toLocaleString()}`}
													colors={colors}
												/>
											)}
											{prediction.filters.minPrice && (
												<FilterTag
													label="Min"
													value={`₦${Number(prediction.filters.minPrice).toLocaleString()}`}
													colors={colors}
												/>
											)}
										</ScrollView>
									</View>
								</Pressable>
							))}
						</ScrollView>
					)}
				</View>
			)}

			<BottomSheet isVisible={filterOpen} onClose={() => setFilterOpen(false)}>
				<View className="gap-8">
					<ThemedText style={{ fontFamily: Fonts.bold }} type="semibold">
						Filter
					</ThemedText>
					<View className="gap-6">
						<View className="gap-3">
							<ThemedText style={{ fontSize: 14 }}>Category</ThemedText>
							<HotingVariantFilter
								value={filter.category?.valueOf()}
								onSelect={(v) =>
									updateFilter({ category: v === "All" ? undefined : v })
								}
							/>
						</View>
						<View className="gap-3">
							<ThemedText style={{ fontSize: 14 }}>Price Range</ThemedText>
							<RangeSlider
								withInput
								onChange={(low, high) =>
									updateFilter({ minPrice: low, maxPrice: high })
								}
								min={0}
								max={10000000}
							/>
						</View>
						<View>
							<FloatingLabelInput
								focused
								disabled
								onPress={(e) => {
									e.stopPropagation();
									setLocationInputOpen(true);
								}}
								label="Location"
								suffix={
									<MapPin color={hexToRgba(colors.text, 0.8)} size={16} />
								}
								placeholder={selectedLocation?.address ?? "Enter location"}
							/>
							<LocationSelectInput
								isVisible={locationInputOpen}
								onSelect={(selected) => {
									setSelectedLocation(selected);
									updateFilter({
										city: selected.city,
										state: selected.state,
										country: selected.country,
									});
								}}
								onClose={() => setLocationInputOpen(false)}
							/>
						</View>
						<View className="gap-3">
							<ThemedText style={{ fontSize: 14 }}>Facilities</ThemedText>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View className="flex-row my-1 gap-2">
									{[
										"All",
										...FACILITIES_BY_VARIANT.filter((v) => {
											if (variant !== "All") {
												const variants = v.hostingVariants.map((i) =>
													i.valueOf(),
												);
												return variants.includes(variant);
											}
											return true;
										}).map((v) => v.facility.valueOf()),
									].map((item, index) => {
										const Icon =
											FACILITY_ICONS[cast<keyof typeof FACILITY_ICONS>(item)] ??
											FALLBACK_FACILITY_ICON;
										return (
											<TextPill
												icon={Icon}
												selected={facilities.includes(item)}
												onSelect={(v) => {
													setFacilities((c) => {
														if (v === "All") {
															return ["All"];
														}
														if (!c.includes(v)) {
															return [...c, v].filter((n) => n !== "All");
														} else {
															const newVal = c.filter((i) => i !== v);
															if (newVal.length === 0) {
																newVal.push("All");
															}
															return newVal;
														}
													});
												}}
												key={index}
											>
												{item}
											</TextPill>
										);
									})}
								</View>
							</ScrollView>
						</View>
						<View className="gap-3">
							<ThemedText style={{ fontSize: 14 }}>Rating</ThemedText>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View className="flex-row my-1 gap-2">
									{Array.from({ length: 5 }).map((_, index) => (
										<RatingPill
											selected={filter.minRating === index + 1}
											onSelect={(v) => updateFilter({ minRating: Number(v) })}
											key={index}
										>
											{String(index + 1)}
										</RatingPill>
									))}
								</View>
							</ScrollView>
						</View>
						<View className="flex-row items-center justify-center gap-8 px-4">
							<Button onPress={handleReset} type="tinted" style={{ flex: 1 }}>
								<ThemedText content="tinted">Reset</ThemedText>
							</Button>
							<Button onPress={handleApply} type="primary" style={{ flex: 1 }}>
								<ThemedText content="primary">Apply</ThemedText>
							</Button>
						</View>
					</View>
				</View>
			</BottomSheet>
		</View>
	);
};

const FilterTag = ({
	label,
	value,
	colors,
}: {
	label: string;
	value: string;
	colors: any;
}) => (
	<View className="flex-row items-center mr-3">
		<ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
			{label}:{" "}
		</ThemedText>
		<ThemedText style={{ fontSize: 12, fontWeight: "500" }}>{value}</ThemedText>
	</View>
);

export default HostingFilterManager;
