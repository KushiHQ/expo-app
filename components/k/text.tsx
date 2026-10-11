import { Text, type TextProps, type TextStyle } from 'react-native';
import { color, type as T, type TypeName } from '@/lib/k/theme';

type Props = TextProps & {
	v?: TypeName;
	c?: keyof typeof color | string;
	center?: boolean;
	weight?: TextStyle['fontWeight'];
};

/** Kushi text. `v` picks a type-scale step, `c` a token colour (or any colour). */
export function KText({ v = 'body', c, center, style, ...rest }: Props) {
	const tint = c ? ((color as Record<string, string>)[c] ?? c) : undefined;
	return <Text {...rest} style={[T[v], tint ? { color: tint } : null, center ? { textAlign: 'center' } : null, style]} />;
}

/** Amber triangle + mono label that opens a section (HUD eyebrow). */
export function Eyebrow({ children, c = 'muted' }: { children: React.ReactNode; c?: keyof typeof color }) {
	return (
		<Text style={[T.label, { color: color[c] }]}>
			<Text style={{ color: color.amber }}>▸ </Text>
			{children}
		</Text>
	);
}
