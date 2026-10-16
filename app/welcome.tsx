import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BadgeCheck, KeyRound, Landmark } from 'lucide-react-native';
import { Button, Eyebrow, KText, Logo, Mark } from '@/components/k';
import { Contours } from '@/components/k/contours';
import { color, gutter, radius } from '@/lib/k/theme';
import { maxWidth, useLayout } from '@/lib/k/layout';
import { markWelcomed } from '@/lib/k/session';

const POINTS = [
	{ icon: BadgeCheck, t: 'Verified homes', d: 'Every listing shows exactly what Kushi has checked.' },
	{ icon: Landmark, t: 'Rent held in escrow', d: 'Your money is released only when you have your keys.' },
	{ icon: KeyRound, t: 'Signed on your phone', d: 'A real tenancy agreement — no paperwork chase.' }
];

/** First launch only. Guests can explore straight away; an account is needed only to apply. */
export default function Welcome() {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const done = async (to: '/' | '/auth/sign-up' | '/auth/sign-in') => {
		await markWelcomed();
		if (to === '/') router.back();
		else router.replace(to);
	};

	const hero = (
		<Animated.View entering={FadeInDown.duration(700)} style={{ gap: 14 }}>
			<Eyebrow>Finding your way</Eyebrow>
			<KText v="hero" style={layout.compact ? undefined : s.heroBig}>
				A home you can{' '}
				<KText v="hero" c="amber" style={layout.compact ? undefined : s.heroBig}>
					trust
				</KText>
				, a few taps away.
			</KText>
		</Animated.View>
	);
	const points = (
		<View style={{ gap: layout.compact ? 14 : 18 }}>
			{POINTS.map((p, i) => (
				<Animated.View key={p.t} entering={FadeInDown.delay(180 + i * 90).duration(600)} style={{ flexDirection: 'row', gap: 12 }}>
					<p.icon size={20} color={color.amber} />
					<View style={{ flex: 1 }}>
						<KText v="bodyStrong">{p.t}</KText>
						<KText v="small">{p.d}</KText>
					</View>
				</Animated.View>
			))}
		</View>
	);
	const actions = (
		<Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ gap: 10 }}>
			<Button title="Start exploring" size="lg" block onPress={() => done('/')} testID="welcome-explore" />
			<View style={{ flexDirection: 'row', gap: 10 }}>
				<Button title="Create account" variant="ghost" style={{ flex: 1 }} onPress={() => done('/auth/sign-up')} />
				<Button title="Sign in" variant="ghost" style={{ flex: 1 }} onPress={() => done('/auth/sign-in')} />
			</View>
		</Animated.View>
	);

	if (layout.compact)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg }}>
				<Contours />
				<View style={{ flex: 1, paddingHorizontal: gutter, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, justifyContent: 'space-between' }}>
					<Logo height={22} />
					<View style={{ gap: 22 }}>
						{hero}
						{points}
					</View>
					{actions}
				</View>
			</View>
		);

	// Tablets. Wide landscape windows: copy on the left, the contour map on the right.
	// Portrait / narrower windows: one centered column.
	const split = layout.expanded && layout.landscape;
	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Contours opacity={split ? 0.3 : 0.5} />
			<View style={{ flex: 1, paddingHorizontal: layout.gutter, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }}>
				<Logo height={26} />
				{split ? (
					<View style={[s.split, { maxWidth: maxWidth.content }]}>
						<View style={{ flex: 1, maxWidth: 520, justifyContent: 'center', gap: 36 }}>
							{hero}
							{points}
							{actions}
						</View>
						<MapPanel />
					</View>
				) : (
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<View style={{ width: '100%', maxWidth: maxWidth.form, alignSelf: 'center', gap: 40 }}>
							{hero}
							{points}
							{actions}
						</View>
					</View>
				)}
			</View>
		</View>
	);
}

/** The brand visual for the wide welcome: a framed contour field with the mark at its heart. */
function MapPanel() {
	const [box, setBox] = useState<{ w: number; h: number } | null>(null);
	return (
		<Animated.View entering={FadeIn.delay(200).duration(900)} style={s.panel} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
			{box ? <Contours seed={23} opacity={1} width={box.w} height={box.h} /> : null}
			<View style={s.markWrap} pointerEvents="none">
				<View style={s.markTile}>
					<Mark size={72} />
				</View>
			</View>
			<View style={s.caption} pointerEvents="none">
				<Eyebrow>Kushi Housing · Nigeria</Eyebrow>
			</View>
		</Animated.View>
	);
}

const s = StyleSheet.create({
	heroBig: { fontSize: 56, lineHeight: 58, letterSpacing: -3 },
	split: { flex: 1, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'stretch', gap: 56, paddingTop: 28 },
	panel: { flex: 1, borderRadius: radius.xl, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, overflow: 'hidden' },
	markWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
	markTile: { width: 132, height: 132, borderRadius: radius.xl, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	caption: { position: 'absolute', left: 24, bottom: 22 }
});
