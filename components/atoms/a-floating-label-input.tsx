import React from "react";
import {
	TextInput,
	FocusEvent,
	TextInputProps,
	BlurEvent,
	Pressable,
	View,
} from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import Animated, {
	interpolate,
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { MageEye, MageEyeOff } from "../icons/i-eye";

type Props = TextInputProps & {
	focused?: boolean;
	label?: string;
};

const FloatingLabelInput = React.forwardRef<TextInput, Props>((props, ref) => {
	const {
		label,
		style,
		placeholder,
		focused: fixedFocused,
		onChangeText,
		secureTextEntry: defaultSecureText,
		...rest
	} = props;
	const colors = useThemeColors();
	const [value, setValue] = React.useState("");
	const [secureTextEntry, setSecureTextEntry] = React.useState(
		defaultSecureText ?? false,
	);

	const [focused, setFocused] = React.useState(false);
	const animatedValue = useSharedValue(props.value ? 1 : 0);
	const shouldFloat = fixedFocused || focused || value.toString().length > 0;

	React.useEffect(() => {
		animatedValue.value = withTiming(shouldFloat ? 1 : 0, {
			duration: 200,
		});
	}, [shouldFloat]);

	const focusedColor = hexToRgba(colors["text"], 0.6);

	const animatedLabelStyle = useAnimatedStyle(() => {
		const top = interpolate(animatedValue.value, [0, 1], [18, 8]);
		const fontSize = interpolate(animatedValue.value, [0, 1], [16, 12]);
		const color = interpolateColor(
			animatedValue.value,
			[0, 1],
			[colors["text"], focusedColor],
		);

		return {
			top,
			fontSize,
			color,
		};
	});

	const handleFocus = (e: FocusEvent) => {
		setFocused(true);
		props.onFocus?.(e);
	};

	const handleBlur = (e: BlurEvent) => {
		setFocused(false);
		props.onBlur?.(e);
	};

	const handleConntainerPress = () => {
		(ref as any)?.current.focus();
	};

	const handleChange = (text: string) => {
		setValue(text);
		onChangeText?.(text);
	};

	return (
		<View>
			<Pressable
				onPress={handleConntainerPress}
				className="border px-2.5 pt-[18px] rounded-lg"
				style={{
					borderColor: hexToRgba(colors["text"], 0.2),
					borderWidth: 1.5,
					backgroundColor: hexToRgba(colors["text"], 0.06),
				}}
			>
				<Animated.Text
					style={[
						{ color: colors["text"], left: 12, position: "absolute" },
						animatedLabelStyle,
					]}
				>
					{label}
				</Animated.Text>
				<TextInput
					onChangeText={handleChange}
					placeholderTextColor={hexToRgba(colors["text"], 0.5)}
					placeholder={shouldFloat ? placeholder : undefined}
					style={[{ color: colors["text"], fontSize: 16 }, style]}
					onFocus={handleFocus}
					onBlur={handleBlur}
					secureTextEntry={secureTextEntry}
					ref={ref}
					{...rest}
				/>
			</Pressable>
			{defaultSecureText && (
				<Pressable
					onPress={() => setSecureTextEntry((c) => !c)}
					className="absolute right-4 top-5"
				>
					{secureTextEntry ? (
						<MageEye color={colors["text"]} />
					) : (
						<MageEyeOff color={colors["text"]} />
					)}
				</Pressable>
			)}
		</View>
	);
});

FloatingLabelInput.displayName = "FloatingLabelInput";

export default FloatingLabelInput;
