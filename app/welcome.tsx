import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BadgeCheck, KeyRound, Landmark } from 'lucide-react-native';
import { Button, Eyebrow, KText, Logo } from '@/components/k';
import { Contours } from '@/components/k/contours';
import { color, gutter } from '@/lib/k/theme';
import { markWelcomed } from '@/lib/k/session';

const POINTS = [
	{ icon: BadgeCheck, t: 'Verified homes', d: 'Every listing shows exactly what Kushi has checked.' },
	{ icon: Landmark, t: 'Rent held in escrow', d: 'Your money is released only when you have your keys.' },
	{ icon: KeyRound, t: 'Signed on your phone', d: 'A real tenancy agreement — no paperwork chase.' }
];

/** First launch only. Guests can explore straight away; an account is needed only to apply. */
export default function Welcome() {
	const insets = useSafeAreaInsets();
	const done = async (to: '/' | '/auth/sign-up' | '/auth/sign-in') => {
		await markWelcomed();
		if (to === '/') router.back();
		else router.replace(to);
	};
	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Contours />
			<View style={{ flex: 1, paddingHorizontal: gutter, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, justifyContent: 'space-between' }}>
				<Logo height={22} />
				<View style={{ gap: 22 }}>
					<Animated.View entering={FadeInDown.duration(700)} style={{ gap: 14 }}>
						<Eyebrow>Finding your way</Eyebrow>
						<KText v="hero">
							A home you can <KText v="hero" c="amber">trust</KText>, a few taps away.
						</KText>
					</Animated.View>
					<View style={{ gap: 14 }}>
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
				</View>
				<Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ gap: 10 }}>
					<Button title="Start exploring" size="lg" block onPress={() => done('/')} testID="welcome-explore" />
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title="Create account" variant="ghost" style={{ flex: 1 }} onPress={() => done('/auth/sign-up')} />
						<Button title="Sign in" variant="ghost" style={{ flex: 1 }} onPress={() => done('/auth/sign-in')} />
					</View>
				</Animated.View>
			</View>
		</View>
	);
}
