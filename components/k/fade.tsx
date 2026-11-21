import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * A top-to-bottom colour fade over a photo. SVG, so it also renders in the web
 * build (react-native-linear-gradient has no web version and crashes there).
 */
export function Fade({ colors, locations, style = StyleSheet.absoluteFill }: { colors: string[]; locations: number[]; style?: StyleProp<ViewStyle> }) {
	const id = `fade${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	return (
		<View style={style} pointerEvents="none">
			<Svg width="100%" height="100%" preserveAspectRatio="none">
				<Defs>
					<LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
						{colors.map((c, i) => (
							<Stop key={i} offset={locations[i]} stopColor={c} />
						))}
					</LinearGradient>
				</Defs>
				<Rect width="100%" height="100%" fill={`url(#${id})`} />
			</Svg>
		</View>
	);
}
