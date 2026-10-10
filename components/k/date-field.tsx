import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { color, radius } from '@/lib/k/theme';
import { date as fmt } from '@/lib/k/format';
import { KText } from './text';
import { Chip } from './surface';
import { Sheet } from './sheet';
import { Button } from './button';

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const plus = (days: number) => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return iso(d);
};
const firstOfNext = () => {
	const d = new Date();
	return iso(new Date(d.getFullYear(), d.getMonth() + 1, 1));
};

/** Move-in date: quick picks + native calendar. Value is YYYY-MM-DD. */
export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	const [temp, setTemp] = useState<Date>(value ? new Date(value + 'T00:00:00') : new Date());
	const today = new Date();
	const quick = [
		{ l: 'Next week', v: plus(7) },
		{ l: 'In 2 weeks', v: plus(14) },
		{ l: '1st of next month', v: firstOfNext() }
	];
	return (
		<View style={{ gap: 8 }}>
			<KText v="label">{label}</KText>
			<Pressable onPress={() => Platform.OS !== 'web' && setOpen(true)} style={s.box} accessibilityRole="button">
				<CalendarDays size={18} color={color.amber} />
				<KText v="bodyStrong" style={{ flex: 1 }}>
					{value ? fmt(value) : 'Choose a date'}
				</KText>
				<KText v="xs">Change</KText>
			</Pressable>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
				{quick.map((q) => (
					<Chip key={q.l} label={q.l} on={value === q.v} onPress={() => onChange(q.v)} />
				))}
			</View>
			{open && Platform.OS === 'android' ? (
				<DateTimePicker
					value={temp}
					mode="date"
					minimumDate={today}
					onChange={(e, d) => {
						setOpen(false);
						if (e.type === 'set' && d) onChange(iso(d));
					}}
				/>
			) : null}
			{Platform.OS === 'ios' ? (
				<Sheet open={open} onClose={() => setOpen(false)} title={label} footer={<Button title="Done" block onPress={() => (onChange(iso(temp)), setOpen(false))} />}>
					<DateTimePicker value={temp} mode="date" display="inline" minimumDate={today} themeVariant="dark" accentColor={color.amber} onChange={(_, d) => d && setTemp(d)} />
				</Sheet>
			) : null}
		</View>
	);
}

const s = StyleSheet.create({
	box: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 54, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 }
});
