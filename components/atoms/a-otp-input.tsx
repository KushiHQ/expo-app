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
	value: propValue,
	defaultValue,
	...rest
}) => {
	const colors = useThemeColors();

	const [internalValue, setInternalValue] = React.useState(defaultValue || "");
	const value = propValue !== undefined ? String(propValue) : internalValue;

	const [focusedIndex, setFocusedIndex] = React.useState(0);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	useEffect(() => {
		inputRefs.current = inputRefs.current.slice(0, length);
	}, [length]);

	useEffect(() => {
		inputRefs.current[0]?.focus();
	}, []);

	const updateValue = (newVal: string) => {
		setInternalValue(newVal);
		onChangeText?.(newVal);
	};

	const handleChange = (index: number, text: string) => {
		if (text.length > 1) {
			handlePaste(text);
			return;
		}

		const newValue = value.split("");
		newValue[index] = text;
		const updated = newValue.join("");

		updateValue(updated);

		if (text && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (index: number, key: string) => {
		if (key === "Backspace") {
			const newValue = value.split("");

			if (value[index]) {
				newValue[index] = "";
				const updated = newValue.join("");
				updateValue(updated);
			} else if (index > 0) {
				newValue[index - 1] = "";
				const updated = newValue.join("");
				updateValue(updated);
				inputRefs.current[index - 1]?.focus();
			}
		}
	};

	const handlePaste = (text: string) => {
		const cleaned = text.replace(/[^0-9]/g, "").slice(0, length);

		const newValue = cleaned.padEnd(Math.min(value.length, length), "");
		updateValue(newValue);

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
					maxLength={length}
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
