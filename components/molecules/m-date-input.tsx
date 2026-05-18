import { GestureResponderEvent, Platform, Pressable, useColorScheme, View } from 'react-native';
import FloatingLabelInput, { FloatingLabelInputProps } from '../atoms/a-floating-label-input';
import React from 'react';
import { CalendarDays } from 'lucide-react-native';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

const DateInput: React.FC<FloatingLabelInputProps & { mode?: 'date' | 'time' }> = ({
  mode = 'date',
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const colors = useThemeColors();
  const theme = useColorScheme() ?? 'light';
  const [date, setDate] = React.useState(new Date());

  const onChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setDate(date);
      props.onChangeText?.(date.toISOString().split('T')[0]);
    }
    setOpen(false);
  };

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode,
        onChange,
        is24Hour: true,
        onBlur: () => setOpen(false),
      });
    }

    setOpen(true);
  };
  return (
    <>
      <View className="relative flex-1">
        <FloatingLabelInput
          {...props}
          editable={false}
          pointerEvents="none"
          value={props.value}
          suffix={<CalendarDays size={16} color={hexToRgba(colors.text, 0.4)} />}
        />
        <Pressable
          disabled={props.disabled}
          className="absolute inset-0"
          onPress={handlePress}
        ></Pressable>
      </View>
      {open === true && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode={mode}
          is24Hour={true}
          onBlur={() => setOpen(false)}
          onChange={onChange}
          accentColor={colors.accent}
          themeVariant={theme}
        />
      )}
    </>
  );
};

export default DateInput;
