import { Pressable, ScrollView, TextInput, View } from "react-native";
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
import { MapPin } from "lucide-react-native";
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

const HostingFilterManager = () => {
	const [variant, setVariant] = React.useState("All");
	const [facilities, setFacilities] = React.useState(["All"]);
	const [filterOpen, setFilterOpen] = React.useState(false);
	const [locationInputOpen, setLocationInputOpen] = React.useState(false);
	const [selectedLocation, setSelectedLocation] =
		React.useState<SelectedLocation>();
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

	React.useEffect(() => {
		updateFilter({
			facilities: facilities.includes("All") ? undefined : facilities,
		});
	}, [facilities]);

	return (
		<View>
			<View
				className="flex-row items-center gap-2 p-4 py-2 rounded-full"
				style={{ backgroundColor: hexToRgba(colors["text"], 0.1) }}
			>
				<View className="flex-row items-center flex-1 gap-1">
					<LineiconsSearch1 color={hexToRgba(colors["text"], 0.5)} />
					<TextInput
						cursorColor={colors.primary}
						className="flex-1"
						placeholderClassName="text-ellipsis"
						style={{ color: colors["text"], fontSize: 18 }}
						placeholderTextColor={hexToRgba(colors["text"], 0.5)}
						placeholder="Enter location, price, property type, pr..."
					/>
				</View>
				<View className="flex-row items-center gap-2">
					<Pressable
						onPress={() => {
							setFilterOpen((c) => !c);
						}}
					>
						<JamSettingsAlt color={hexToRgba(colors["text"], 0.5)} />
					</Pressable>
					<View
						style={{ backgroundColor: colors["text"], height: 24, width: 24 }}
						className="items-center justify-center rounded-full"
					>
						<MaterialSymbolsLightMapOutlineRounded
							color={colors["background"]}
							size={20}
						/>
					</View>
				</View>
			</View>
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

export default HostingFilterManager;
