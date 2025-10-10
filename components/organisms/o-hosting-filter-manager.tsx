import { Pressable, TextInput, View } from "react-native";
import { LineiconsSearch1 } from "../icons/i-search";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { JamSettingsAlt } from "../icons/i-settings";
import { MaterialSymbolsLightMapOutlineRounded } from "../icons/i-map";
import BottomSheet from "../atoms/a-bottom-sheet";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { Fonts } from "@/lib/constants/theme";

const HostingFilterManager = () => {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const colors = useThemeColors();

  return (
    <View>
      <View
        className="flex-row items-center gap-2 p-4 py-2 rounded-full"
        style={{ backgroundColor: hexToRgba(colors["text"], 0.1) }}
      >
        <View className="flex-row items-center flex-1 gap-1">
          <LineiconsSearch1 color={hexToRgba(colors["text"], 0.5)} />
          <TextInput
            className="flex-1"
            style={{ color: colors["text"], fontSize: 18 }}
            placeholderTextColor={hexToRgba(colors["text"], 0.5)}
            placeholder="Enter location, price, property type, pr..."
          />
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => setFilterOpen((c) => !c)}>
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
      <BottomSheet
        isVisible={filterOpen}
        onClose={() => setFilterOpen((c) => !c)}
      >
        <ThemedText style={{ fontFamily: Fonts.bold }} type="semibold">
          Filter
        </ThemedText>
      </BottomSheet>
    </View>
  );
};

export default HostingFilterManager;
