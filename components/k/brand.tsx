import { View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { color } from '@/lib/k/theme';
import { ICON_ARMS, ICON_POINTER, ICON_VIEWBOX, LOGO_ARMS, LOGO_DOT, LOGO_LETTERS, LOGO_POINTER, LOGO_VIEWBOX } from '@/lib/k/brand-paths';
import { KText } from './text';

const ratio = (vb: string) => {
	const [, , w, h] = vb.split(' ').map(Number);
	return w / h;
};

/** The Kushi mark: three axes + the heading pointer. */
export function Mark({ size = 28, ink = color.fg, accent = color.amber }: { size?: number; ink?: string; accent?: string }) {
	return (
		<Svg width={size} height={size / ratio(ICON_VIEWBOX)} viewBox={ICON_VIEWBOX}>
			<Path d={ICON_ARMS} fill={ink} />
			<Polygon points={ICON_POINTER} fill={accent} />
		</Svg>
	);
}

/** Kushi logo + venture name ("Kushi | Housing"). */
export function Logo({ height = 22, venture = 'Housing' }: { height?: number; venture?: string | null }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel={`Kushi ${venture ?? ''}`}>
			<Svg width={height * ratio(LOGO_VIEWBOX)} height={height} viewBox={LOGO_VIEWBOX}>
				<Path d={LOGO_ARMS} fill={color.fg} />
				<Polygon points={LOGO_POINTER} fill={color.amber} />
				<Path d={LOGO_LETTERS} fill={color.fg} />
				<Path d={LOGO_DOT} fill={color.amber} />
			</Svg>
			{venture ? (
				<>
					<View style={{ width: 1, height: height * 0.8, backgroundColor: color.line2 }} />
					<KText style={{ fontFamily: 'Unbounded_500Medium', fontSize: height * 0.62, letterSpacing: -0.5, color: color.fg2 }}>{venture}</KText>
				</>
			) : null}
		</View>
	);
}
