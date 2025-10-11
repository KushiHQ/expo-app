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
import {
  FACILITIES_BY_VARIANT,
  HOSTING_VARIANTS,
} from "@/lib/types/enums/hostings";
import TextPill from "../molecules/m-text-pill-pill";
import RangeSlider from "../atoms/a-range-slider";
import FloatingLabelInput from "../atoms/a-floating-label-input";
import { MapPin } from "lucide-react-native";
import LocationSelectInput from "../molecules/m-location-select-input";
import { LocationFeature } from "@/lib/types/queries/mapbox";
import RatingPill from "../molecules/m-rating-pill";
import Button from "../atoms/a-button";

const HostingFilterManager = () => {
  const [variant, setVariant] = React.useState("All");
  const [rating, setRating] = React.useState<number>();
  const [facilities, setFacilities] = React.useState(["All"]);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [locationInputOpen, setLocationInputOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] =
    React.useState<LocationFeature>();
  const colors = useThemeColors();

  function handleApply() {
    setFilterOpen(false);
  }

  function handleReset() {
    setVariant("All");
    setRating(undefined);
    setFacilities(["All"]);
    setSelectedLocation(undefined);
  }

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
      <BottomSheet isVisible={filterOpen} onClose={() => setFilterOpen(false)}>
        <View className="gap-8">
          <ThemedText style={{ fontFamily: Fonts.bold }} type="semibold">
            Filter
          </ThemedText>
          <View className="gap-6">
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Category</ThemedText>
              <ScrollView horizontal>
                <View className="flex-row my-1 gap-2">
                  {["All", ...HOSTING_VARIANTS].map((item, index) => (
                    <TextPill
                      selected={variant === item}
                      onSelect={setVariant}
                      key={index}
                    >
                      {item}
                    </TextPill>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Price Range</ThemedText>
              <RangeSlider min={0} max={10000000} />
            </View>
            <View>
              <FloatingLabelInput
                focused
                editable={false}
                onPress={(e) => {
                  e.stopPropagation();
                  setLocationInputOpen(true);
                }}
                label="Location"
                suffix={
                  <MapPin color={hexToRgba(colors.text, 0.8)} size={16} />
                }
                placeholder={selectedLocation?.place_name ?? "Enter location"}
              />
              <LocationSelectInput
                isVisible={locationInputOpen}
                onSelect={setSelectedLocation}
                onClose={() => setLocationInputOpen(false)}
              />
            </View>
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Facilities</ThemedText>
              <ScrollView horizontal>
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
                  ].map((item, index) => (
                    <TextPill
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
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Rating</ThemedText>
              <ScrollView horizontal>
                <View className="flex-row my-1 gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingPill
                      selected={rating === index + 1}
                      onSelect={(v) => setRating(Number(v))}
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
