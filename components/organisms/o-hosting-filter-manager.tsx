import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SURFACE } from '@/lib/constants/surface';
import { LineiconsSearch1 } from '../icons/i-search';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { JamSettingsAlt } from '../icons/i-settings';
import { MaterialSymbolsLightMapOutlineRounded } from '../icons/i-map';
import BottomSheet from '../atoms/a-bottom-sheet';
import ThemedText from '../atoms/a-themed-text';
import React from 'react';
import { Fonts } from '@/lib/constants/theme';
import { FACILITIES_BY_VARIANT } from '@/lib/types/enums/hostings';
import TextPill from '../molecules/m-text-pill-pill';
import RangeSlider from '../atoms/a-range-slider';
import FloatingLabelInput from '../atoms/a-floating-label-input';
import { LayoutList, MapPin, Sparkles } from 'lucide-react-native';
import LocationSelectInput, { SelectedLocation } from '../molecules/m-location-select-input';
import RatingPill from '../molecules/m-rating-pill';
import Button from '../atoms/a-button';
import { HotingVariantFilter } from '../molecules/m-hosting-variant-filter';
import { FACILITY_ICONS, FALLBACK_FACILITY_ICON } from '@/lib/types/enums/hosting-icons';
import { cast } from '@/lib/types/utils';
import { useHostingFilterStore } from '@/lib/stores/hostings';
import { useDebounce } from '@/lib/hooks/use-debounce';

import Animated, { LinearTransition } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';
import {
  AiHostingSearchPredictionsQuery,
  HostingVerificationTier,
  useAiHostingSearchPredictionsQuery,
} from '@/lib/services/graphql/generated';
import { formatTierLabel } from '@/lib/utils/verification/tier';
import Skeleton from '../atoms/a-skeleton';
import { useRouter } from '@/lib/hooks/use-router';
import { Reset } from '../icons/i-delete';

// Minimum verification tier the guest can filter by (the server matches this
// tier OR higher). "Unverified" is intentionally omitted — it's not a filter.
const TIER_FILTER_OPTIONS: HostingVerificationTier[] = [
  HostingVerificationTier.IdentityVerified,
  HostingVerificationTier.AddressVerified,
  HostingVerificationTier.TitleChecked,
  HostingVerificationTier.KushiVetted,
];
type Props = {
  isMapView?: boolean;
};

const HostingFilterManager: React.FC<Props> = ({ isMapView }) => {
  const router = useRouter();
  const [variant, setVariant] = React.useState('All');
  const [facilities, setFacilities] = React.useState(['All']);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [locationInputOpen, setLocationInputOpen] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<SelectedLocation>();

  const [searchInput, setSearchInput] = React.useState('');
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const [{ fetching, data }] = useAiHostingSearchPredictionsQuery({
    variables: {
      userInput: debouncedSearchInput,
    },
    pause: debouncedSearchInput.length <= 5,
  });

  const [isInputFocused, setIsInputFocused] = React.useState(false);
  // Dropdown visibility is tracked separately from focus: tapping a suggestion
  // blurs the input, and if the dropdown were gated on focus it would unmount
  // before the row's onPress fires (so nothing happened).
  const [predictionsOpen, setPredictionsOpen] = React.useState(false);
  const textInputRef = React.useRef<TextInput>(null);

  const colors = useThemeColors();
  const { filter, updateFilter, resetFilter } = useHostingFilterStore();

  React.useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidHide', () => {
      setIsInputFocused(false);
      // Dismissing the keyboard is a "never mind" — close the suggestions too.
      setPredictionsOpen(false);
    });
    return () => listener.remove();
  }, []);

  function handleApply() {
    setFilterOpen(false);
  }

  function handleReset() {
    resetFilter();
    setVariant('All');
    setFacilities(['All']);
    setSelectedLocation(undefined);
  }

  function handleSelectPrediction(
    prediction: AiHostingSearchPredictionsQuery['aiHostingSearchPredictions'][number],
  ) {
    const predictionFilters = prediction.filters;
    const rawQuery = searchInput.trim();
    updateFilter({
      // Free-text query drives the search reliably even when the AI's
      // structured values don't exactly match stored enums/locations.
      search: rawQuery || undefined,
      city: predictionFilters.city,
      state: predictionFilters.state,
      country: predictionFilters.country,
      propertyType: predictionFilters.propertyType ?? undefined,
      facilities: predictionFilters.facilities ?? undefined,
      minPrice: predictionFilters.minPrice ? Number(predictionFilters.minPrice) : undefined,
      maxPrice: predictionFilters.maxPrice ? Number(predictionFilters.maxPrice) : undefined,
    });
    setSearchInput(prediction.summary ?? '');
    setPredictionsOpen(false);
    textInputRef.current?.blur();
    setIsInputFocused(false);
    Keyboard.dismiss();
  }

  React.useEffect(() => {
    updateFilter({
      facilities: facilities.includes('All') ? undefined : facilities,
    });
  }, [facilities, updateFilter]);

  const handleCategoryChange = React.useCallback(
    (v: string) => {
      updateFilter({ propertyType: v === 'All' ? undefined : v });
    },
    [updateFilter],
  );

  const handlePriceChange = React.useCallback(
    (low: number, high: number) => {
      updateFilter({ minPrice: low, maxPrice: high });
    },
    [updateFilter],
  );

  const handleRatingChange = React.useCallback(
    (v: string | number) => {
      updateFilter({ minRating: Number(v) });
    },
    [updateFilter],
  );

  const handleToggleView = () => {
    if (isMapView) {
      router.back();
    } else {
      router.push('/hostings/map');
    }
  };

  return (
    <View style={{ zIndex: 50 }}>
      <Animated.View
        layout={LinearTransition.springify().damping(25).stiffness(300)}
        className={`flex-row gap-3 rounded-2xl px-4 ${
          isInputFocused ? 'min-h-[120px] items-start py-4' : 'min-h-[56px] items-center py-2.5'
        }`}
        style={
          {
            backgroundColor: isMapView ? colors.background : hexToRgba(colors.text, 0.05),
            boxShadow: SURFACE.shadow,
          } as any
        }
      >
        <View
          className="flex-1 flex-row gap-2"
          style={{ alignItems: isInputFocused ? 'flex-start' : 'center' }}
        >
          {searchInput.length > 0 || JSON.stringify(filter).length > 5 ? (
            <Pressable
              onPress={() => {
                setSearchInput('');
                setPredictionsOpen(false);
                setIsInputFocused(false);
                textInputRef.current?.blur();
                Keyboard.dismiss();
                resetFilter();
              }}
              aria-label="Clear search and filters"
              hitSlop={10}
              style={{ marginTop: isInputFocused ? 2 : 0 }}
            >
              <Reset width={18} height={18} color={hexToRgba(colors.text, 0.9)} />
            </Pressable>
          ) : (
            <View style={{ marginTop: isInputFocused ? 4 : 0 }}>
              <LineiconsSearch1 color={hexToRgba(colors['text'], 0.5)} />
            </View>
          )}

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TextInput
              ref={textInputRef}
              value={searchInput}
              cursorColor={colors.primary}
              className={twMerge('w-full', isInputFocused && 'pt-1.5')}
              // NOTE: `multiline` is intentionally constant. On iOS, toggling
              // multiline swaps the underlying native view (single- vs multi-line),
              // which remounts the input, drops focus, and dismisses the keyboard
              // the instant it opens. Keep it fixed and drive the collapsed vs.
              // expanded look with maxHeight/numberOfLines (those don't remount).
              style={{
                // Collapsed, the multiline input can't show/ellipsize its value in
                // the short 22px box, so hide it and show a single-line overlay.
                color: !isInputFocused && searchInput.length > 0 ? 'transparent' : colors['text'],
                fontSize: 14,
                maxHeight: isInputFocused ? 96 : 22,
              }}
              placeholderTextColor={hexToRgba(colors['text'], 0.5)}
              // Collapsed: a multiline input can't ellipsize its own placeholder,
              // so we blank it and render a single-line overlay below instead.
              placeholder={
                isInputFocused
                  ? 'Enter location, price, property type, property amenities and features etc.'
                  : ''
              }
              onChangeText={(t) => {
                setSearchInput(t);
                setPredictionsOpen(true);
              }}
              multiline
              numberOfLines={isInputFocused || searchInput.length > 0 ? 4 : 1}
              onFocus={() => {
                setIsInputFocused(true);
                setPredictionsOpen(true);
              }}
              onBlur={() => setIsInputFocused(false)}
              textAlignVertical={isInputFocused ? 'top' : 'center'}
            />
            {!isInputFocused && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  justifyContent: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: 14,
                    color: hexToRgba(colors['text'], searchInput.length > 0 ? 0.9 : 0.5),
                  }}
                >
                  {searchInput.length > 0
                    ? searchInput
                    : 'Enter location, price, property type, amenities…'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-2" style={{ marginTop: isInputFocused ? 2 : 0 }}>
          <Pressable
            onPress={() => {
              setFilterOpen((c) => !c);
            }}
          >
            <JamSettingsAlt color={hexToRgba(colors['text'], 0.5)} />
          </Pressable>
          <TouchableOpacity
            onPress={handleToggleView}
            style={{ backgroundColor: colors.secondary, height: 36, width: 36 }}
            className="items-center justify-center rounded-xl shadow-sm"
          >
            {isMapView ? (
              <LayoutList color="#fff" size={18} />
            ) : (
              <MaterialSymbolsLightMapOutlineRounded color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {predictionsOpen && searchInput.length > 5 && (
        <View
          className="mt-2 overflow-hidden rounded-[20px]"
          // In-flow (not absolute): an absolutely-positioned dropdown sitting
          // below the parent's box is invisible to touches on Android, so the
          // suggestions render but can't be tapped. Keeping it in normal flow
          // lets the container grow to contain it and stay tappable.
          style={
            {
              backgroundColor: hexToRgba(colors.text, 0.05),
              boxShadow: SURFACE.shadowHigh,
              maxHeight: 300,
              zIndex: 100,
              elevation: 12,
            } as any
          }
        >
          {fetching ? (
            <View className="items-center justify-center">
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-4 p-4"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: hexToRgba(colors.text, 0.05),
                  }}
                >
                  <Skeleton style={{ width: 38, height: 38, borderRadius: 12 }} />
                  <View className="flex-1 gap-2">
                    <Skeleton style={{ width: '70%', height: 20 }} />
                    <Skeleton style={{ width: '90%', height: 15 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {data?.aiHostingSearchPredictions?.map((prediction, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectPrediction(prediction)}
                  className="flex-row items-center gap-4 p-4"
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: hexToRgba(colors.text, 0.05),
                  }}
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
                      className="mt-1 flex-row gap-2"
                    >
                      {prediction.filters.city && (
                        <FilterTag label="City" value={prediction.filters.city} colors={colors} />
                      )}
                      {prediction.filters.state && (
                        <FilterTag label="State" value={prediction.filters.state} colors={colors} />
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

      {(isInputFocused || predictionsOpen) && (
        <Pressable
          onPress={() => {
            textInputRef.current?.blur();
            Keyboard.dismiss();
            setIsInputFocused(false);
            setPredictionsOpen(false);
          }}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
        />
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
                value={filter.propertyType?.valueOf()}
                onSelect={handleCategoryChange}
              />
            </View>
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Price Range</ThemedText>
              <RangeSlider withInput onChange={handlePriceChange} min={0} max={10000000} />
            </View>
            <View>
              <FloatingLabelInput
                focused
                disabled
                onPress={(e) => {
                  e.stopPropagation();
                  Keyboard.dismiss();
                  setLocationInputOpen(true);
                }}
                label="Location"
                suffix={<MapPin color={hexToRgba(colors.text, 0.8)} size={16} />}
                placeholder={selectedLocation?.address ?? 'Enter location'}
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
                <View className="my-1 flex-row gap-2">
                  {[
                    'All',
                    ...FACILITIES_BY_VARIANT.filter((v) => {
                      if (variant !== 'All') {
                        const variants = v.hostingVariants.map((i) => i.valueOf());
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
                            if (v === 'All') {
                              return ['All'];
                            }
                            if (!c.includes(v)) {
                              return [...c, v].filter((n) => n !== 'All');
                            } else {
                              const newVal = c.filter((i) => i !== v);
                              if (newVal.length === 0) {
                                newVal.push('All');
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
                <View className="my-1 flex-row gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingPill
                      selected={filter.minRating === index + 1}
                      onSelect={handleRatingChange}
                      key={index}
                    >
                      {String(index + 1)}
                    </RatingPill>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="gap-3">
              <ThemedText style={{ fontSize: 14 }}>Verification</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="my-1 flex-row gap-2">
                  {TIER_FILTER_OPTIONS.map((tier) => {
                    const active = filter.verificationTier === tier;
                    return (
                      <Pressable
                        key={tier}
                        onPress={() =>
                          updateFilter({
                            verificationTier: active ? undefined : tier,
                          })
                        }
                        className="rounded-full px-3.5 py-2"
                        style={{
                          backgroundColor: active
                            ? hexToRgba(colors.primary, 0.16)
                            : hexToRgba(colors.text, 0.06),
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 12,
                            fontFamily: Fonts.semibold,
                            color: active ? colors.primary : colors.text,
                          }}
                        >
                          {formatTierLabel(tier)}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
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

const FilterTag = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View className="mr-3 flex-row items-center">
    <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>{label}: </ThemedText>
    <ThemedText style={{ fontSize: 12, fontWeight: '500' }}>{value}</ThemedText>
  </View>
);

export default HostingFilterManager;
