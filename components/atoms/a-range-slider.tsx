import React, { FC, useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "rn-range-slider";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";

const formatValue = (value: number, currencySymbol: string): string => {
  if (value >= 1_000_000) {
    return `${currencySymbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${currencySymbol}${(value / 1_000).toFixed(1)}K`;
  }
  return `${currencySymbol}${value}`;
};

interface RangeSliderProps {
  min: number;
  max: number;
  initialLow?: number;
  initialHigh?: number;
  onChange?: (low: number, high: number) => void;
  step?: number;
  currencySymbol?: string;
}

const RangeSlider: FC<RangeSliderProps> = ({
  min,
  max,
  initialLow = min,
  initialHigh = max,
  onChange,
  step = 1,
  currencySymbol = "₦",
}) => {
  const colors = useThemeColors();
  const [low, setLow] = useState(initialLow);
  const [high, setHigh] = useState(initialHigh);

  const onValuesChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(newLow);
      setHigh(newHigh);
      if (onChange) {
        onChange(newLow, newHigh);
      }
    },
    [onChange],
  );

  const renderThumb = useCallback(() => {
    return (
      <View
        style={[
          styles.thumb,
          { backgroundColor: colors.text, borderColor: colors.primary },
        ]}
      />
    );
  }, [colors]);

  const renderRail = useCallback(() => {
    return (
      <View
        style={[styles.rail, { backgroundColor: hexToRgba(colors.text, 0.3) }]}
      />
    );
  }, [colors]);

  const renderRailSelected = useCallback(() => {
    return (
      <View
        style={[styles.railSelected, { backgroundColor: colors.primary }]}
      />
    );
  }, [colors]);

  const renderLabel = useCallback(
    (value: number) => {
      return (
        <View style={[styles.labelBubble, { backgroundColor: colors.primary }]}>
          <Text style={styles.labelText}>
            {formatValue(value, currencySymbol)}
          </Text>
        </View>
      );
    },
    [colors, currencySymbol],
  );

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        min={min}
        max={max}
        step={step}
        low={low}
        high={high}
        onValueChanged={onValuesChange}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  slider: {
    width: "100%",
    // This style is for the container that holds all the slider parts
  },
  thumb: {
    width: 12,
    height: 12,
    borderRadius: 12.5,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rail: {
    flex: 1,
    height: 2,
    borderRadius: 2,
  },
  railSelected: {
    flex: 1,
    height: 2,
    borderRadius: 2,
  },
  labelBubble: {
    position: "absolute",
    top: -40,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  labelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RangeSlider;
