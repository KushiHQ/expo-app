import React from "react";
import BottomSheet from "../atoms/a-bottom-sheet";
import { Dimensions, Keyboard, Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useQuery } from "@tanstack/react-query";
import { cast } from "@/lib/types/utils";
import {
  LocationFeature,
  LocationQueryResponse,
} from "@/lib/types/queries/mapbox";
import { TablerMapPinFilled } from "../icons/i-map";
import { useDebounce } from "@/lib/hooks/use-debounce";
import SearchInput from "../atoms/a-search-input";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSelect?: (location: LocationFeature) => void;
};

const LocationSelectInput: React.FC<Props> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  const colors = useThemeColors();
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 500);
  const { isFetching, data } = useQuery({
    queryKey: [{ key: "locations", debouncedQuery }],
    queryFn: async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${debouncedQuery}.json?country=NG&access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`,
      );
      return cast<LocationQueryResponse>(await res.json());
    },
  });

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
            {!isFetching && !data?.features && (
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
            {data?.features?.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  onSelect?.(item);
                  handleClose();
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <TablerMapPinFilled
                  size={18}
                  color={hexToRgba(colors.text, 0.7)}
                />
                <ThemedText>{item.place_name}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

export default LocationSelectInput;
