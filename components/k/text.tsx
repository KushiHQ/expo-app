import { Text, type TextProps, type TextStyle } from 'react-native';
import { color, type as T, type TypeName } from '@/lib/k/theme';

type Props = TextProps & {
	v?: TypeName;
	c?: keyof typeof color | string;
	center?: boolean;
	weight?: TextStyle['fontWeight'];
};

/**
 * How far each step may grow with the phone's text-size setting (iOS Larger
 * Text, Android font size). Uncapped, a 30pt display title doubled and broke
 * every layout; body text still grows half again, big headings only a little.
 */
const MAX_SCALE: Record<TypeName, number> = {
	hero: 1.1,
	display: 1.15,
	title: 1.2,
	money: 1.25,
	heading: 1.3,
	lead: 1.4,
	body: 1.5,
	bodyStrong: 1.5,
	small: 1.5,
	smallStrong: 1.5,
	xs: 1.5,
	label: 1.4,
	micro: 1.4
};

/** Kushi text. `v` picks a type-scale step, `c` a token colour (or any colour). */
export function KText({ v = 'body', c, center, style, ...rest }: Props) {
	const tint = c ? ((color as Record<string, string>)[c] ?? c) : undefined;
	return (
		<Text
			maxFontSizeMultiplier={MAX_SCALE[v] ?? 1.5}
			{...rest}
			style={[T[v], tint ? { color: tint } : null, center ? { textAlign: 'center' } : null, style]}
		/>
	);
}

/** Amber triangle + mono label that opens a section (HUD eyebrow). */
export function Eyebrow({ children, c = 'muted' }: { children: React.ReactNode; c?: keyof typeof color }) {
	return (
		<Text maxFontSizeMultiplier={MAX_SCALE.label} style={[T.label, { color: color[c] }]}>
			<Text style={{ color: color.amber }}>▸ </Text>
			{children}
		</Text>
	);
}
