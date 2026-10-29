import { forwardRef, useRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { Eye, EyeOff, Minus, Plus } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { KText } from './text';

type FieldProps = TextInputProps & {
	label?: string;
	hint?: string;
	error?: string | null;
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
	optional?: boolean;
};

/** Labelled text input. Pass testID for web previews (renders data-testid). */
export const Field = forwardRef<TextInput, FieldProps>(function Field({ label, hint, error, prefix, suffix, optional, style, multiline, ...rest }, ref) {
	const [focus, setFocus] = useState(false);
	return (
		<View style={{ gap: 8 }}>
			{label ? (
				<KText v="label">
					{label}
					{optional ? <KText v="xs"> · optional</KText> : null}
				</KText>
			) : null}
			<View style={[s.box, multiline && { minHeight: 110, alignItems: 'flex-start', paddingVertical: 12 }, focus && s.focus, !!error && s.err]}>
				{prefix}
				<TextInput
					ref={ref}
					maxFontSizeMultiplier={1.4}
					placeholderTextColor={color.dim}
					selectionColor={color.amber}
					cursorColor={color.amber}
					multiline={multiline}
					onFocus={(e) => {
						setFocus(true);
						rest.onFocus?.(e);
					}}
					onBlur={(e) => {
						setFocus(false);
						rest.onBlur?.(e);
					}}
					style={[s.input, multiline && { textAlignVertical: 'top' }, style]}
					{...rest}
				/>
				{suffix}
			</View>
			{error ? (
				<KText v="xs" c="danger">
					{error}
				</KText>
			) : hint ? (
				<KText v="xs">{hint}</KText>
			) : null}
		</View>
	);
});

export function PasswordField(props: FieldProps) {
	const [show, setShow] = useState(false);
	return (
		<Field
			{...props}
			secureTextEntry={!show}
			autoCapitalize="none"
			autoCorrect={false}
			suffix={
				<Pressable accessibilityLabel={show ? 'Hide password' : 'Show password'} onPress={() => setShow((v) => !v)} hitSlop={10}>
					{show ? <EyeOff size={18} color={color.muted} /> : <Eye size={18} color={color.muted} />}
				</Pressable>
			}
		/>
	);
}

/** Six-box one-time code input with paste support. */
export function OtpField({ value, onChange, length = 6, onComplete, invalid }: { value: string; onChange: (v: string) => void; length?: number; onComplete?: (v: string) => void; invalid?: boolean }) {
	const ref = useRef<TextInput>(null);
	return (
		<Pressable onPress={() => ref.current?.focus()} style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
			{Array.from({ length }).map((_, i) => {
				const ch = value[i];
				const active = i === Math.min(value.length, length - 1);
				return (
					<View key={i} style={[s.otp, active && s.focus, invalid && s.err]}>
						<KText style={{ fontFamily: font.monoMedium, fontSize: 22, color: color.fg }}>{ch ?? ''}</KText>
					</View>
				);
			})}
			<TextInput
				ref={ref}
				value={value}
				autoFocus
				keyboardType="number-pad"
				textContentType="oneTimeCode"
				autoComplete="sms-otp"
				maxLength={length}
				onChangeText={(t) => {
					const v = t.replace(/\D/g, '').slice(0, length);
					onChange(v);
					if (v.length === length) onComplete?.(v);
				}}
				style={s.hidden}
				testID="otp"
			/>
		</Pressable>
	);
}

/** − value + stepper. */
export function Stepper({ value, onChange, min = 1, max = 99, format }: { value: number; onChange: (n: number) => void; min?: number; max?: number; format?: (n: number) => string }) {
	return (
		<View style={s.stepper}>
			<Pressable accessibilityLabel="Fewer" disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} style={[s.stepBtn, value <= min && { opacity: 0.3 }]}>
				<Minus size={16} color={color.fg} />
			</Pressable>
			<KText v="bodyStrong" style={{ minWidth: 90, textAlign: 'center' }}>
				{format ? format(value) : value}
			</KText>
			<Pressable accessibilityLabel="More" disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} style={[s.stepBtn, value >= max && { opacity: 0.3 }]}>
				<Plus size={16} color={color.fg} />
			</Pressable>
		</View>
	);
}

/** Selectable card with a radio dot (choices in forms). */
export function Choice({ title, detail, on, onPress }: { title: string; detail?: string; on: boolean; onPress: () => void }) {
	return (
		<Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress} style={({ pressed }) => [s.choice, on && s.choiceOn, pressed && { opacity: 0.85 }]}>
			<View style={[s.dot, on && { borderColor: color.amber }]}>{on ? <View style={s.dotIn} /> : null}</View>
			<View style={{ flex: 1, gap: 2 }}>
				<KText v="smallStrong">{title}</KText>
				{detail ? <KText v="xs">{detail}</KText> : null}
			</View>
		</Pressable>
	);
}

/** Checkbox row for consents and toggles. */
export function Check({ on, onPress, children }: { on: boolean; onPress: () => void; children: React.ReactNode }) {
	return (
		<Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
			<View style={[s.box20, on && { backgroundColor: color.amber, borderColor: color.amber }]}>{on ? <KText style={{ color: color.onAmber, fontSize: 13, lineHeight: 15 }}>✓</KText> : null}</View>
			<View style={{ flex: 1 }}>{children}</View>
		</Pressable>
	);
}

const s = StyleSheet.create({
	box: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	focus: { borderColor: color.amber },
	err: { borderColor: color.danger },
	input: { flex: 1, color: color.fg, fontFamily: font.body, fontSize: 16, paddingVertical: 12, outlineStyle: 'none' } as object,
	otp: { width: 46, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, alignItems: 'center', justifyContent: 'center' },
	hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
	stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, paddingHorizontal: 8, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	stepBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	choiceOn: { borderColor: color.amber, backgroundColor: 'rgba(245,158,11,0.07)' },
	dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	dotIn: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber },
	box20: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center', marginTop: 1 }
});
