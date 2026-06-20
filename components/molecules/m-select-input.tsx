import React from 'react';
import { FloatingLabelInputProps } from '../atoms/a-floating-label-input';
import BottomSheet from '../atoms/a-bottom-sheet';
import {
  Dimensions,
  FlatList,
  GestureResponderEvent,
  ListRenderItem,
  Pressable,
  View,
} from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Check, ChevronDown } from 'lucide-react-native';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import SearchInput from '../atoms/a-search-input';
import { cast } from '@/lib/types/utils';
import EmptyList from './m-empty-list';
import { capitalize } from '@/lib/utils/text';
import { twMerge } from 'tailwind-merge';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Fonts } from '@/lib/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const LIST_MAX_HEIGHT = SCREEN_HEIGHT * 0.45;
export type SelectionDetails = { selected?: boolean };

interface BaseProps<T> extends Omit<FloatingLabelInputProps, 'defaultValue'> {
  defaultValue?: T;
  getValueString?: (value: T) => string;
  selectedValueString?: string;
  options: T[];
  onSelect?: (v: T) => void;
  getLabelString?: (v?: T, options?: Array<object>) => string;
  footer?: React.ReactNode;
  renderItem: React.FC<T & SelectionDetails>;
}

type WithoutSearch<T> = BaseProps<T> & { searchable?: false };
type WithSearch<T> = BaseProps<T> & { searchable?: true; searchField: string };
type Props<T> = WithSearch<T> | WithoutSearch<T>;

const getValueString = (value: any) => {
  if (typeof value === 'object') return cast<Record<string, any>>(value).value;
  return value;
};

const getLabelString = (value: any, options?: Array<object>) => {
  if (typeof value === 'object') return cast<Record<string, any>>(value).label;
  else if (options) {
    const label = cast<Record<string, any>>(
      options.find((i) => cast<Record<string, any>>(i).value === value),
    )?.label;
    if (label) return label;
  }
  return value;
};

const SelectInput = <T extends object>(props: Props<T>) => {
  const { options, renderItem: RenderItem, onSelect, ...rest } = props;
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.defaultValue);
  const [search, setSearch] = React.useState('');
  const colors = useThemeColors();

  const valueStringFunc = props.getValueString ?? getValueString;
  const selectedValue = React.useMemo(() => valueStringFunc(cast(value)), [value, valueStringFunc]);
  const selectedLabel = React.useMemo(
    () => (props.getLabelString ?? getLabelString)(value, props.options),
    [value, props.options, props.getLabelString],
  );

  const hasValue = !!value;
  const shouldFloat = hasValue || !!rest.focused;

  const labelAnim = useSharedValue(shouldFloat ? 1 : 0);
  const chevronAnim = useSharedValue(0);

  // Pre-compute colors outside worklets — hexToRgba is not a worklet and cannot run on the UI thread
  const labelColorFrom = colors.text;
  const labelColorTo = hexToRgba(colors.text, 0.6);

  React.useEffect(() => {
    labelAnim.value = withTiming(shouldFloat ? 1 : 0, { duration: 200 });
  }, [shouldFloat, labelAnim]);

  React.useEffect(() => {
    chevronAnim.value = withTiming(open ? 1 : 0, { duration: 200 });
  }, [open, chevronAnim]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(labelAnim.value, [0, 1], [20, 7]),
    fontSize: interpolate(labelAnim.value, [0, 1], [16, 12]),
    color: interpolateColor(labelAnim.value, [0, 1], [labelColorFrom, labelColorTo]),
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chevronAnim.value, [0, 1], [0, 180])}deg` }],
  }));

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
      if ((a as any).sequence && (b as any).sequence)
        return (a as any).sequence - (b as any).sequence;
      return fieldA.localeCompare(fieldB);
    });
  }, [rest, search, options, valueStringFunc]);

  React.useEffect(() => {
    if (props.defaultValue && !value) setValue(props.defaultValue);
  }, [props.defaultValue, value]);

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const renderListOption: ListRenderItem<T> = React.useCallback(
    ({ item }) => {
      const isSelected =
        String(selectedValue).toLowerCase() === String(valueStringFunc(item)).toLowerCase();
      return (
        <Pressable
          style={{ marginBottom: 8 }}
          onPress={() => {
            setValue(item);
            onSelect?.(item);
            setOpen(false);
            setSearch('');
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
      <Pressable
        onPress={handlePress}
        className={twMerge('relative overflow-hidden rounded-xl', props.className)}
        style={{
          backgroundColor: colors['surface-01'],
          borderWidth: 1.5,
          borderColor: hexToRgba(colors.text, 0.08),
          paddingHorizontal: 12,
          paddingTop: props.label ? 22 : 14,
          paddingBottom: 10,
          minHeight: 64,
        }}
      >
        {props.label && (
          <Animated.Text
            numberOfLines={1}
            style={[
              {
                position: 'absolute',
                left: 12,
                fontFamily: Fonts.regular,
                zIndex: 1,
              },
              animatedLabelStyle,
            ]}
          >
            {props.label}
          </Animated.Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Only show text when label is floated (shouldFloat=true) or a value is picked.
              When shouldFloat=false and no value, the large animated label IS the placeholder. */}
          {value || shouldFloat ? (
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 16,
                flex: 1,
                marginRight: 8,
                marginTop: 4,
                fontFamily: Fonts.regular,
                color: !value ? hexToRgba(colors.text, 0.45) : colors.text,
              }}
            >
              {props.selectedValueString ??
                (value ? capitalize(selectedLabel ?? '') : (rest.placeholder ?? ''))}
            </ThemedText>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Animated.View style={animatedChevronStyle}>
            <ChevronDown size={18} color={hexToRgba(colors.text, 0.45)} />
          </Animated.View>
        </View>
      </Pressable>

      <BottomSheet scrollable={false} isVisible={open} onClose={() => setOpen(false)}>
        <View style={{ paddingBottom: 20 }}>
          <View style={{ marginBottom: rest.description ? 6 : 20 }}>
            <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 17 }}>
              {props.label}
            </ThemedText>
          </View>
          {rest.description && (
            <ThemedText
              style={{
                fontSize: 13,
                color: hexToRgba(colors.text, 0.55),
                lineHeight: 19,
                marginBottom: 16,
              }}
            >
              {rest.description}
            </ThemedText>
          )}

          {rest.searchable && (
            <View style={{ marginBottom: 12 }}>
              <SearchInput value={search} onChangeText={setSearch} placeholder="Search..." />
            </View>
          )}

          <View style={{ maxHeight: LIST_MAX_HEIGHT }}>
            <FlatList
              data={filtered}
              renderItem={renderListOption}
              keyExtractor={(item, index) =>
                (item as any).id || (item as any).code || index.toString()
              }
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: selected ? hexToRgba(colors.primary, 0.4) : hexToRgba(colors.text, 0.08),
        backgroundColor: selected ? hexToRgba(colors.primary, 0.07) : colors['surface-01'],
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: description ? 3 : 0 }}>
        <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 15 }}>
          {capitalize(label)}
        </ThemedText>
        {description && (
          <ThemedText
            style={{
              fontSize: 12,
              color: hexToRgba(colors.text, 0.5),
              lineHeight: 17,
            }}
          >
            {description}
          </ThemedText>
        )}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1.5,
          borderColor: selected ? colors.primary : hexToRgba(colors.text, 0.3),
          backgroundColor: selected ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <Check size={12} color={colors.background} strokeWidth={3} />}
      </View>
    </View>
  );
};
