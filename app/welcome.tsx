import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Fade } from '@/components/k/fade';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BadgeCheck, KeyRound, Landmark } from 'lucide-react-native';
import { Button, Eyebrow, KText, Logo, Mark } from '@/components/k';
import { Contours } from '@/components/k/contours';
import { color, gutter, radius } from '@/lib/k/theme';
import { maxWidth, useLayout } from '@/lib/k/layout';
import { markWelcomed, setHostIntent } from '@/lib/k/session';

const POINTS = [
	{ icon: BadgeCheck, t: 'Verified homes', d: 'Every listing shows exactly what Kushi has checked.' },
	{ icon: Landmark, t: 'Rent held in escrow', d: 'Your money is released only when you have your keys.' },
	{ icon: KeyRound, t: 'Signed on your phone', d: 'A real tenancy agreement — no paperwork chase.' }
];

/**
 * First launch only. The two buttons are the app's only "renter or host" question: Find a home goes to
 * the optional Location screen, then Explore (no account needed to browse); List a property goes to
 * sign-up, then straight into hosting on New listing.
 */
export default function Welcome() {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const findHome = async () => {
		await markWelcomed();
		await setHostIntent(false);
		router.replace('/search-location');
	};
	const listProperty = async () => {
		await markWelcomed();
		await setHostIntent(true);
		router.replace({ pathname: '/auth/sign-up', params: { mode: 'host' } });
	};
	const signIn = async () => {
		await markWelcomed();
		await setHostIntent(false);
		router.replace('/auth/sign-in');
	};

	const hero = (
		<Animated.View entering={FadeInDown.duration(700)} style={{ gap: 14 }}>
			<Eyebrow>Kushi Housing</Eyebrow>
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
			<Button title="Find a home" size="lg" block onPress={findHome} testID="welcome-explore" />
			<Button title="List a property" variant="ghost" size="lg" block onPress={listProperty} testID="welcome-host" />
			<Pressable onPress={signIn} style={{ alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 }} testID="welcome-sign-in">
				<KText v="small">
					Have an account? <KText v="smallStrong" style={{ color: color.fg, textDecorationLine: 'underline', textDecorationColor: color.amber }}>Sign in</KText>
				</KText>
			</Pressable>
		</Animated.View>
	);

	if (layout.compact)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg }}>
				{/* A home at dusk behind the logo, fading into the page. Decoration only: not a Kushi listing. */}
				<Animated.View entering={FadeIn.duration(900)} style={[s.photo, { height: Math.round(layout.height * 0.46) }]} pointerEvents="none">
					<Image source={require('@/assets/images/onboarding/welcome.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '35%' }} accessible={false} />
					<Fade colors={['rgba(7,8,11,0.6)', 'rgba(7,8,11,0)', 'rgba(7,8,11,0)', 'rgba(7,8,11,0.92)', color.bg]} locations={[0, 0.24, 0.5, 0.82, 1]} />
				</Animated.View>
				<View style={{ flex: 1, paddingHorizontal: gutter, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, justifyContent: 'space-between' }}>
					<Logo height={22} />
					<View style={{ gap: layout.height < 700 ? 16 : 22 }}>
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
	photo: { position: 'absolute', left: 0, right: 0, top: 0 },
	split: { flex: 1, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'stretch', gap: 56, paddingTop: 28 },
	panel: { flex: 1, borderRadius: radius.xl, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, overflow: 'hidden' },
	markWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
	markTile: { width: 132, height: 132, borderRadius: radius.xl, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	caption: { position: 'absolute', left: 24, bottom: 22 }
});
