import { ActivityIndicator, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import * as Haptics from 'expo-haptics';
import { color, font, glow, radius } from '@/lib/k/theme';
import { KText } from './text';

type Variant = 'amber' | 'solid' | 'ghost' | 'quiet' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'children' | 'style'> & {
	title: string;
	variant?: Variant;
	size?: Size;
	loading?: boolean;
	block?: boolean;
	icon?: React.ReactNode;
	trailing?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
};

const H: Record<Size, number> = { sm: 38, md: 48, lg: 56 };
const FG: Record<Variant, string> = { amber: color.onAmber, solid: color.bg, ghost: color.fg, quiet: color.fg2, danger: '#fff' };

/** Pill button. One amber button per screen — it means "this way". */
export function Button({ title, variant = 'amber', size = 'md', loading, block, icon, trailing, disabled, style, onPress, ...rest }: Props) {
	const off = disabled || loading;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: !!off, busy: !!loading }}
			disabled={off}
			onPress={(e) => {
				if (variant === 'amber') Haptics.selectionAsync().catch(() => {});
				onPress?.(e);
			}}
			style={({ pressed }) => [
				s.base,
				{ height: H[size], paddingHorizontal: size === 'sm' ? 14 : 22 },
				s[variant],
				variant === 'amber' && !off ? glow : null,
				block && { alignSelf: 'stretch' },
				off && { opacity: 0.45 },
				pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
				style
			]}
			{...rest}
		>
			{loading ? (
				<ActivityIndicator color={FG[variant]} />
			) : (
				<View style={s.row}>
					{icon}
					<KText style={[s.label, { color: FG[variant], fontSize: size === 'lg' ? 17 : size === 'sm' ? 14 : 16 }]}>{title}</KText>
					{trailing}
				</View>
			)}
		</Pressable>
	);
}

/** Round icon-only button (header actions, tool buttons). */
export function IconButton({ children, label, onPress, tone = 'ghost', size = 42, disabled }: { children: React.ReactNode; label: string; onPress?: () => void; tone?: 'ghost' | 'amber' | 'glass'; size?: number; disabled?: boolean }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			hitSlop={6}
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
				tone === 'ghost' && { borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
				tone === 'glass' && { backgroundColor: 'rgba(7,8,11,0.62)' },
				tone === 'amber' && { backgroundColor: color.amber },
				disabled && { opacity: 0.4 },
				pressed && { opacity: 0.7 }
			]}
		>
			{children}
		</Pressable>
	);
}

const s = StyleSheet.create({
	base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	label: { fontFamily: font.bodySemi },
	amber: { backgroundColor: color.amber },
	solid: { backgroundColor: color.fg },
	ghost: { borderWidth: 1, borderColor: color.line2, backgroundColor: 'transparent' },
	quiet: { backgroundColor: 'transparent' },
	danger: { backgroundColor: color.danger }
});
