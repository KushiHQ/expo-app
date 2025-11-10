import React from "react";
import BottomSheet from "../atoms/a-bottom-sheet";
import { Dimensions, Keyboard, Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useQuery } from "@tanstack/react-query";
import { cast } from "@/lib/types/utils";
import { TablerMapPinFilled } from "../icons/i-map";
import { useDebounce } from "@/lib/hooks/use-debounce";
import SearchInput from "../atoms/a-search-input";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Google Places API Types
interface GooglePlacePrediction {
	description: string;
	place_id: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
	};
	terms: Array<{
		offset: number;
		value: string;
	}>;
}

interface GooglePlacesResponse {
	predictions: GooglePlacePrediction[];
	status: string;
}

interface GooglePlaceDetails {
	result: {
		geometry: {
			location: {
				lat: number;
				lng: number;
			};
		};
		formatted_address: string;
		name: string;
		place_id: string;
		address_components: Array<{
			long_name: string;
			short_name: string;
			types: string[];
		}>;
	};
}

export type SelectedLocation = {
	name: string;
	address: string;
	placeId: string;
	coordinates: { lat: number; lng: number };
	city: string | null;
	state: string | null;
	country: string | null;
};

type Props = {
	isVisible: boolean;
	onClose: () => void;
	onSelect?: (location: SelectedLocation) => void;
};

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const LocationSelectInput: React.FC<Props> = ({
	isVisible,
	onClose,
	onSelect,
}) => {
	const colors = useThemeColors();
	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 500);

	const { isFetching, data } = useQuery({
		queryKey: ["locations", debouncedQuery],
		queryFn: async () => {
			if (!debouncedQuery) return null;

			const url = new URL(
				"https://maps.googleapis.com/maps/api/place/autocomplete/json",
			);

			url.searchParams.append("input", debouncedQuery);
			url.searchParams.append("key", GOOGLE_API_KEY!);
			url.searchParams.append("components", "country:ng");
			url.searchParams.append("types", "geocode");

			const res = await fetch(url.toString());
			return cast<GooglePlacesResponse>(await res.json());
		},
		enabled: !!debouncedQuery && debouncedQuery.length > 2,
	});

	const handleSelectLocation = async (prediction: GooglePlacePrediction) => {
		try {
			const url = new URL(
				"https://maps.googleapis.com/maps/api/place/details/json",
			);

			url.searchParams.append("place_id", prediction.place_id);
			url.searchParams.append("key", GOOGLE_API_KEY!);
			url.searchParams.append(
				"fields",
				"geometry,formatted_address,name,place_id,address_components",
			);

			const res = await fetch(url.toString());
			const data = cast<GooglePlaceDetails>(await res.json());

			if (data.result) {
				// Extract city, state, and country from address_components
				const addressComponents = data.result.address_components;

				const city =
					addressComponents.find((c) => c.types.includes("locality"))
						?.long_name ||
					addressComponents.find((c) =>
						c.types.includes("administrative_area_level_2"),
					)?.long_name ||
					null;

				const state =
					addressComponents.find((c) =>
						c.types.includes("administrative_area_level_1"),
					)?.long_name || null;

				const country =
					addressComponents.find((c) => c.types.includes("country"))
						?.long_name || null;

				onSelect?.({
					name: prediction.structured_formatting.main_text,
					address: data.result.formatted_address,
					placeId: prediction.place_id,
					coordinates: data.result.geometry.location,
					city,
					state,
					country,
				});
				handleClose();
			}
		} catch (error) {
			console.error("Error fetching place details:", error);
		}
	};

	const handleClose = () => {
		Keyboard.dismiss();
		onClose?.();
	};

	return (
		<BottomSheet isVisible={isVisible} onClose={handleClose}>
			<View className="gap-8">
				<ThemedText style={{ fontFamily: Fonts.bold }} type="semibold">
					Find Location
				</ThemedText>
				<View className="gap-2">
					<SearchInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search location...."
					/>
					<View style={{ height: SCREEN_HEIGHT * 0.2 }}>
						{!isFetching && !data?.predictions?.length && query.length > 0 && (
							<ThemedText
								style={{
									color: hexToRgba(colors.text, 0.6),
									padding: 4,
									marginTop: 4,
								}}
							>
								{query.length < 3
									? "Type at least 3 characters..."
									: "No locations found"}
							</ThemedText>
						)}
						{!query && (
							<ThemedText
								style={{
									color: hexToRgba(colors.text, 0.6),
									padding: 4,
									marginTop: 4,
								}}
							>
								Suggestions will show up here...
							</ThemedText>
						)}
						{data?.predictions?.map((item) => (
							<Pressable
								key={item.place_id}
								onPress={() => handleSelectLocation(item)}
								className="flex-row items-center gap-2 p-2"
							>
								<TablerMapPinFilled
									size={18}
									color={hexToRgba(colors.text, 0.7)}
								/>
								<View className="flex-1">
									<ThemedText style={{ fontFamily: Fonts.medium }}>
										{item.structured_formatting.main_text}
									</ThemedText>
									<ThemedText
										style={{
											fontSize: 12,
											color: hexToRgba(colors.text, 0.6),
										}}
									>
										{item.structured_formatting.secondary_text}
									</ThemedText>
								</View>
							</Pressable>
						))}
					</View>
				</View>
			</View>
		</BottomSheet>
	);
};

export default LocationSelectInput;
