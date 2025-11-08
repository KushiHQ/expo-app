import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React, { useRef, useEffect } from "react";
import { TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  length: number;
};

const OTPInput: React.FC<Props> = ({
  length,
  onChangeText,
  secureTextEntry,
  ...rest
}) => {
  const colors = useThemeColors();
  const [value, setValue] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, text: string) => {
    // Handle paste: if text is longer than 1, it's likely a paste
    if (text.length > 1) {
      handlePaste(text);
      return;
    }

    // Handle single character input
    const newValue = value.split("");
    newValue[index] = text;
    const updated = newValue.join("");
    setValue(updated);
    onChangeText?.(updated);

    // Move to next input if text was entered
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace") {
      const newValue = value.split("");

      if (value[index]) {
        // Clear current input
        newValue[index] = "";
        const updated = newValue.join("");
        setValue(updated);
        onChangeText?.(updated);
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = "";
        const updated = newValue.join("");
        setValue(updated);
        onChangeText?.(updated);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (text: string) => {
    // Clean the pasted text (remove non-numeric characters)
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, length);

    // Pad with existing values if paste is shorter
    const newValue = cleaned.padEnd(Math.min(value.length, length), "");
    setValue(newValue);
    onChangeText?.(newValue);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(cleaned.length, length - 1);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          //@ts-ignore
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={value[index] || ""}
          secureTextEntry={secureTextEntry}
          className="border w-[44px] h-[44px] rounded"
          textAlign="center"
          inputMode="numeric"
          keyboardType="number-pad"
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(index, nativeEvent.key)
          }
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          maxLength={length} // Changed: allow full paste into any input
          cursorColor={colors["primary"]}
          selectTextOnFocus
          style={{
            borderColor:
              focusedIndex === index
                ? colors["primary"]
                : hexToRgba(colors["text"], 0.2),
            color: colors["text"],
            fontSize: 16,
            borderWidth: focusedIndex === index ? 2 : 1,
          }}
          {...rest}
        />
      ))}
    </View>
  );
};

export default OTPInput;
