import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { color } from '@/lib/k/theme';

/** Static topographic contour field — the Kushi "view from above". */
export function Contours({ seed = 7, opacity = 0.5 }: { seed?: number; opacity?: number }) {
	const { width, height } = useWindowDimensions();
	const paths = useMemo(() => {
		let x = seed;
		const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
		const out: { d: string; amber: boolean }[] = [];
		const centers = [
			{ cx: width * 0.78, cy: height * 0.22 },
			{ cx: width * 0.15, cy: height * 0.62 }
		];
		centers.forEach((c, ci) => {
			for (let r = 1; r <= 9; r++) {
				const R = r * Math.min(width, height) * 0.075;
				const pts = 48;
				const wob = Array.from({ length: 6 }, () => rnd() * 0.18);
				let d = '';
				for (let i = 0; i <= pts; i++) {
					const a = (i / pts) * Math.PI * 2;
					const k = 1 + wob[0] * Math.sin(a * 2 + wob[1] * 9) + wob[2] * Math.cos(a * 3 + wob[3] * 7) + wob[4] * Math.sin(a * 5);
					const px = c.cx + Math.cos(a) * R * k * 1.15;
					const py = c.cy + Math.sin(a) * R * k * 0.82;
					d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
				}
				out.push({ d: d + 'Z', amber: ci === 0 && r === 3 });
			}
		});
		return out;
	}, [width, height, seed]);
	return (
		<Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
			<Defs>
				<RadialGradient id="g" cx="80%" cy="15%" r="70%">
					<Stop offset="0" stopColor={color.amber} stopOpacity={0.14} />
					<Stop offset="1" stopColor={color.bg} stopOpacity={0} />
				</RadialGradient>
			</Defs>
			<Rect x={0} y={0} width={width} height={height} fill="url(#g)" />
			{paths.map((p, i) => (
				<Path key={i} d={p.d} fill="none" stroke={p.amber ? color.amber : color.fg} strokeOpacity={p.amber ? 0.7 : 0.09 * opacity * 2} strokeWidth={p.amber ? 1.2 : 0.8} />
			))}
		</Svg>
	);
}
