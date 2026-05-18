import React from 'react';
import {
  TextInput,
  FocusEvent,
  TextInputProps,
  BlurEvent,
  Pressable,
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MageEye, MageEyeOff } from '../icons/i-eye';
import Tooltip from './a-tooltip';
import { CircleQuestionMark } from 'lucide-react-native';
import { Fonts } from '@/lib/constants/theme';

export type FloatingLabelInputProps = TextInputProps & {
  focused?: boolean;
  label?: string;
  description?: string;
  suffix?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

const FloatingLabelInput = React.forwardRef<TextInput, FloatingLabelInputProps>((props, ref) => {
  const {
    label,
    style,
    disabled,
    placeholder,
    description,
    focused: fixedFocused,
    onChangeText,
    secureTextEntry: defaultSecureText,
    containerStyle,
    suffix,
    onPress,
    ...rest
  } = props;
  const colors = useThemeColors();
  const [value, setValue] = React.useState(props.value ?? '');
  const [secureTextEntry, setSecureTextEntry] = React.useState(defaultSecureText ?? false);

  const [focused, setFocused] = React.useState(false);
  const animatedValue = useSharedValue(props.value ? 1 : 0);
  const shouldFloat = fixedFocused || focused || value.toString().length > 0;
  const showCustomPlaceholder = shouldFloat && !value && placeholder;

  React.useEffect(() => {
    animatedValue.value = withTiming(shouldFloat ? 1 : 0, {
      duration: 200,
    });
  }, [shouldFloat, animatedValue]);

  React.useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  const focusedColor = hexToRgba(colors['text'], 0.6);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const top = interpolate(animatedValue.value, [0, 1], [18, 6]);
    const fontSize = interpolate(animatedValue.value, [0, 1], [16, 12]);
    const color = interpolateColor(animatedValue.value, [0, 1], [colors['text'], focusedColor]);

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

  const handleConntainerPress = (e: GestureResponderEvent) => {
    (ref as any)?.current.focus();
    onPress?.(e);
  };

  const handleChange = (text: string) => {
    setValue(text);
    onChangeText?.(text);
  };

  return (
    <View style={{ minHeight: 64 }}>
      <View className="relative">
        <Pressable
          onPress={handleConntainerPress}
          className="relative flex-1 rounded-xl border px-3"
          style={[
            {
              borderColor: hexToRgba(colors.text, 0.08),
              borderWidth: 1.5,
              backgroundColor: colors['surface-01'],
              paddingTop: 22,
              paddingBottom: Platform.OS === 'ios' ? 10 : 6,
            },
            containerStyle,
          ]}
        >
          <Animated.Text
            style={[
              {
                color: colors['text'],
                left: 12,
                position: 'absolute',
                zIndex: 1,
                fontFamily: Fonts.regular,
              },
              animatedLabelStyle,
            ]}
          >
            {label}
            {'  '}
            {description && (
              <Tooltip title={label} description={description}>
                <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
              </Tooltip>
            )}
          </Animated.Text>

          {showCustomPlaceholder && (
            <Animated.Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                position: 'absolute',
                left: 13,
                top: 24,
                fontSize: 16,
                color: hexToRgba(colors['text'], 0.5),
                pointerEvents: 'none',
                right: suffix || defaultSecureText ? 46 : 10,
                fontFamily: Fonts.regular,
              }}
            >
              {placeholder}
            </Animated.Text>
          )}

          <TextInput
            onChangeText={handleChange}
            placeholderTextColor={hexToRgba(colors['text'], 0.5)}
            style={[
              {
                color: colors['text'],
                fontSize: 16,
                paddingRight: suffix || defaultSecureText ? 36 : 0,
                minHeight: 24,
                textAlignVertical: 'center',
                fontFamily: Fonts.regular,
                paddingTop: 0,
                paddingBottom: 0,
              },
              style,
            ]}
            cursorColor={colors['primary']}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry}
            numberOfLines={1}
            ref={ref}
            {...rest}
          />
        </Pressable>
        {suffix && <View className="absolute bottom-4 right-4">{suffix}</View>}
        {defaultSecureText && (
          <Pressable
            onPress={() => setSecureTextEntry((c) => !c)}
            className="absolute right-4 top-[22px]"
          >
            {secureTextEntry ? (
              <MageEye color={colors['text']} />
            ) : (
              <MageEyeOff color={colors['text']} />
            )}
          </Pressable>
        )}
        {disabled && (
          <Pressable
            disabled={disabled}
            className="absolute inset-0"
            onPress={props.onPress}
          ></Pressable>
        )}
      </View>
    </View>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

export default FloatingLabelInput;
