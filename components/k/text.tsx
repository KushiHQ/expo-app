import { Dimensions, Text, type TextProps, type TextStyle } from 'react-native';
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
 * every layout. Many Android phones here ship with that setting above normal,
 * so the limits are tight: reading text grows by up to 30%, the display face
 * hardly at all (it is already large and very wide).
 */
const MAX_SCALE: Record<TypeName, number> = {
	hero: 1,
	display: 1.05,
	title: 1.1,
	money: 1.1,
	heading: 1.15,
	lead: 1.2,
	body: 1.3,
	bodyStrong: 1.3,
	small: 1.3,
	smallStrong: 1.3,
	xs: 1.3,
	label: 1.2,
	micro: 1.2
};

/**
 * The display steps were drawn for a 390pt-wide phone. Most Android phones are
 * 360dp wide (some 320), and the display face is very wide, so on a narrower
 * screen those steps shrink in proportion (a 40pt hero is 37 at 360dp, 33 at
 * 320dp). Reading text keeps its size. Styles passed in still win.
 */
const FITTED: Partial<Record<TypeName, true>> = { hero: true, display: true, title: true, heading: true, money: true };
const fitOf = (w: number, h: number) => Math.max(0.8, Math.min(1, Math.min(w, h) / 390));
let fit = fitOf(Dimensions.get('window').width, Dimensions.get('window').height);
let fitCache: Partial<Record<TypeName, TextStyle>> = {};
Dimensions.addEventListener('change', ({ window }) => {
	const next = fitOf(window.width, window.height);
	if (next !== fit) {
		fit = next;
		fitCache = {};
	}
});
function fitted(v: TypeName): TextStyle | null {
	if (fit === 1 || !FITTED[v]) return null;
	const t = T[v] as TextStyle;
	return (fitCache[v] ??= {
		fontSize: Math.round((t.fontSize ?? 16) * fit * 2) / 2,
		lineHeight: t.lineHeight ? Math.round(t.lineHeight * fit) : undefined,
		letterSpacing: t.letterSpacing ? t.letterSpacing * fit : undefined
	});
}

/** Kushi text. `v` picks a type-scale step, `c` a token colour (or any colour). */
export function KText({ v = 'body', c, center, style, ...rest }: Props) {
	const tint = c ? ((color as Record<string, string>)[c] ?? c) : undefined;
	return (
		<Text
			maxFontSizeMultiplier={MAX_SCALE[v] ?? 1.5}
			{...rest}
			style={[T[v], fitted(v), tint ? { color: tint } : null, center ? { textAlign: 'center' } : null, style]}
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
