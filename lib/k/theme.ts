/**
 * Kushi design tokens for React Native — mirrors KushiHQ/kushi-design (night theme).
 * Amber = direction & action only. Blue = signal. Crisp radii; pills only for
 * things you press or that report state.
 */
import { Platform, type TextStyle } from 'react-native';

export const color = {
	bg: '#07080B',
	bg2: '#0C0E13',
	surface: '#12151C',
	surface2: '#181C25',
	line: 'rgba(242,238,230,0.08)',
	line2: 'rgba(242,238,230,0.16)',
	fg: '#F2EEE6',
	fg2: '#C9C4BA',
	muted: '#8A867E',
	dim: '#55524D',
	amber: '#F59E0B',
	amberHot: '#FFB627',
	onAmber: '#120C02',
	amberSoft: 'rgba(245,158,11,0.12)',
	amberLine: 'rgba(245,158,11,0.45)',
	blue: '#266DD3',
	signal: '#4C8FF0',
	signalSoft: 'rgba(76,143,240,0.14)',
	success: '#3CCB8E',
	successSoft: 'rgba(60,203,142,0.12)',
	danger: '#F0524F',
	dangerSoft: 'rgba(240,82,79,0.12)',
	scrim: 'rgba(7,8,11,0.72)'
} as const;

export const radius = { xs: 2, sm: 4, md: 6, lg: 14, xl: 20, pill: 999 } as const;
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const gutter = 20;

export const font = {
	display: 'Unbounded_500Medium',
	displayBold: 'Unbounded_600SemiBold',
	body: 'InterTight_400Regular',
	bodyMedium: 'InterTight_500Medium',
	bodySemi: 'InterTight_600SemiBold',
	bodyBold: 'InterTight_700Bold',
	mono: 'JetBrainsMono_400Regular',
	monoMedium: 'JetBrainsMono_500Medium'
} as const;

/** Type scale. Display tracking is tight, mono is uppercase + tracked. */
export const type = {
	hero: { fontFamily: font.display, fontSize: 40, lineHeight: 42, letterSpacing: -2.2, color: color.fg },
	display: { fontFamily: font.display, fontSize: 30, lineHeight: 33, letterSpacing: -1.4, color: color.fg },
	title: { fontFamily: font.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.8, color: color.fg },
	heading: { fontFamily: font.display, fontSize: 17, lineHeight: 22, letterSpacing: -0.5, color: color.fg },
	lead: { fontFamily: font.body, fontSize: 17, lineHeight: 26, color: color.fg2 },
	body: { fontFamily: font.body, fontSize: 16, lineHeight: 24, color: color.fg },
	bodyStrong: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 24, color: color.fg },
	small: { fontFamily: font.body, fontSize: 14, lineHeight: 20, color: color.fg2 },
	smallStrong: { fontFamily: font.bodySemi, fontSize: 14, lineHeight: 20, color: color.fg },
	xs: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: color.muted },
	label: { fontFamily: font.mono, fontSize: 11, lineHeight: 15, letterSpacing: 1.5, textTransform: 'uppercase', color: color.muted },
	micro: { fontFamily: font.mono, fontSize: 9.5, lineHeight: 13, letterSpacing: 1.3, textTransform: 'uppercase', color: color.muted },
	money: { fontFamily: font.display, fontSize: 20, lineHeight: 24, letterSpacing: -0.8, color: color.fg }
} satisfies Record<string, TextStyle>;

export type TypeName = keyof typeof type;

export const shadow = Platform.select({
	ios: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
	android: { elevation: 10 },
	default: { boxShadow: '0 14px 40px rgba(0,0,0,0.45)' } as object
});

export const glow = Platform.select({
	ios: { shadowColor: color.amber, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
	android: { elevation: 6 },
	default: { boxShadow: '0 8px 28px rgba(245,158,11,0.32)' } as object
});

export const duration = { instant: 120, fast: 250, base: 450, slow: 800 } as const;
