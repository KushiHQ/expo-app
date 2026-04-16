import React, { FC, useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
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
  withInput?: boolean;
}

const RangeSlider: FC<RangeSliderProps> = ({
  min,
  max,
  initialLow = min,
  initialHigh = max,
  onChange,
  step = 1,
  currencySymbol = "₦",
  withInput = false,
}) => {
  const colors = useThemeColors();
  const [low, setLow] = useState(initialLow);
  const [high, setHigh] = useState(initialHigh);

  const [lowText, setLowText] = useState(initialLow.toString());
  const [highText, setHighText] = useState(initialHigh.toString());

  const onValuesChange = useCallback(
    (newLow: number, newHigh: number) => {
      setLow(newLow);
      setHigh(newHigh);
      setLowText(newLow.toString());
      setHighText(newHigh.toString());
      if (onChange) {
        onChange(newLow, newHigh);
      }
    },
    [onChange],
  );

  const handleLowBlur = () => {
    let parsed = parseInt(lowText.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed) || parsed < min) parsed = min;
    if (parsed > high - step) parsed = high - step;

    setLow(parsed);
    setLowText(parsed.toString());
    if (onChange) onChange(parsed, high);
  };

  const handleHighBlur = () => {
    let parsed = parseInt(highText.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed) || parsed > max) parsed = max;
    if (parsed < low + step) parsed = low + step;

    setHigh(parsed);
    setHighText(parsed.toString());
    if (onChange) onChange(low, parsed);
  };

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

      {withInput && (
        <View style={styles.inputsContainer}>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: hexToRgba(colors.text, 0.2) },
            ]}
          >
            <Text style={{ color: hexToRgba(colors.text, 0.6) }}>Min</Text>
            <View style={styles.inputInner}>
              <Text style={{ color: colors.text }}>{currencySymbol}</Text>
              <TextInput
                value={lowText}
                onChangeText={setLowText}
                onBlur={handleLowBlur}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View
            style={[
              styles.dash,
              { backgroundColor: hexToRgba(colors.text, 0.5) },
            ]}
          />

          <View
            style={[
              styles.inputWrapper,
              { borderColor: hexToRgba(colors.text, 0.2) },
            ]}
          >
            <Text style={{ color: hexToRgba(colors.text, 0.6) }}>Max</Text>
            <View style={styles.inputInner}>
              <Text style={{ color: colors.text }}>{currencySymbol}</Text>
              <TextInput
                value={highText}
                onChangeText={setHighText}
                onBlur={handleHighBlur}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  slider: {
    width: "100%",
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 12.5,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rail: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  railSelected: {
    flex: 1,
    height: 9,
    borderRadius: 5,
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
  // ✨ NEW STYLES
  inputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  dash: {
    width: 12,
    height: 2,
    marginTop: 16, // aligns with inputs below the labels
  },
});

export default RangeSlider;
