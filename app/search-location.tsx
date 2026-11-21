import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Fade } from '@/components/k/fade';
import * as Location from 'expo-location';
import { ArrowLeft, Navigation, Search } from 'lucide-react-native';
import { Button, Chip, Eyebrow, IconButton, KText, Spinner } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { FCT, POPULAR_STATES, PRICE_BANDS, priceBandOn, stateLabel } from '@/lib/k/explore';
import { getAddressFromCoords } from '@/lib/utils/locations';
import { useHostingFilterStore } from '@/lib/stores/hostings';

const HERO_HEIGHT = 230;
const HERO: Record<string, number> = {
	[FCT]: require('@/assets/images/onboarding/location-abuja.webp'),
	Lagos: require('@/assets/images/onboarding/location-lagos.webp')
};

const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * First run, after "Find a home": where to live and the budget. Every choice is written straight
 * into Explore's filter (kept between launches), so Explore opens on these homes.
 */
export default function SearchLocation() {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const column = centered(layout.max('form'));
	const { filter, nearMe, updateFilter, setNearMe } = useHostingFilterStore();
	const [q, setQ] = useState(filter.search ?? '');
	const [locating, setLocating] = useState(false);
	useEffect(() => setQ(filter.search ?? ''), [filter.search]);

	const picked = nearMe ? undefined : filter.state ?? undefined;
	const hero = picked ? HERO[picked] : undefined;

	const commitSearch = () => {
		const search = q.trim() || undefined;
		if (search !== (filter.search ?? undefined)) updateFilter({ search });
	};

	async function locateMe() {
		if (locating) return;
		setLocating(true);
		try {
			// The only place on this screen that asks for location. Refused → nothing changes.
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const at = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
			// Same geocoder hosts' listings are tagged with, so state + city match how listings are stored.
			const place = (await getAddressFromCoords(at.coords.latitude, at.coords.longitude))?.[0];
			if (!place?.region) return;
			setNearMe({ state: place.region, city: place.city || undefined });
		} catch {
			// Location is optional; the state chips still work.
		} finally {
			setLocating(false);
		}
	}

	return (
		<View style={s.screen}>
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
					<View style={s.hero} pointerEvents="none">
						{hero ? <Image source={hero} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '45%', left: '50%' }} transition={250} /> : null}
						<Fade colors={['rgba(7,8,11,0.55)', 'rgba(7,8,11,0.1)', 'rgba(7,8,11,0.25)', color.bg]} locations={[0, 0.3, 0.55, 1]} />
					</View>

					<View style={[s.top, { paddingTop: insets.top + 8 }]}>
						<IconButton label="Back" tone="glass" onPress={leave}>
							<ArrowLeft size={18} color={color.fg} />
						</IconButton>
						<Button title="Skip" variant="quiet" size="sm" onPress={leave} testID="location-skip" />
					</View>

					<View style={[s.body, column]}>
						<View style={{ gap: 10 }}>
							<Eyebrow>Search</Eyebrow>
							<KText v="display">Location</KText>
							<KText v="small">Choose where you want to live. Explore will show homes there first, and you can change it any time.</KText>
						</View>

						<View style={s.qBox}>
							<Search size={18} color={color.muted} />
							<TextInput
								value={q}
								onChangeText={setQ}
								placeholder="Area, estate or landmark"
								placeholderTextColor={color.dim}
								returnKeyType="search"
								onSubmitEditing={commitSearch}
								style={s.qInput}
								accessibilityLabel="Area, estate or landmark"
								testID="location-search"
							/>
						</View>

						<Pressable onPress={locateMe} accessibilityRole="button" accessibilityState={{ selected: nearMe, busy: locating }} style={s.mine} testID="location-use-mine">
							<View style={[s.mineIcon, nearMe && { borderColor: color.fg2 }]}>{locating ? <Spinner /> : <Navigation size={17} color={color.fg2} />}</View>
							<View style={{ flex: 1, gap: 2 }}>
								<KText v="bodyStrong">{nearMe ? 'Using your location' : 'Use my location'}</KText>
								<KText v="xs">Shows homes near you. Kushi only uses your location while the app is open.</KText>
							</View>
						</Pressable>

						<View style={{ gap: 10 }}>
							<KText v="label">State</KText>
							<View style={s.wrap}>
								{POPULAR_STATES.map((st, i) => (
									<View key={st} testID={`location-state-${i}`} collapsable={false}>
										<Chip label={stateLabel(st)} on={picked === st} onPress={() => updateFilter({ state: picked === st ? undefined : st })} />
									</View>
								))}
							</View>
						</View>

						<View style={{ gap: 10 }}>
							<KText v="label">Budget per year</KText>
							<View style={s.wrap}>
								{PRICE_BANDS.map((p, i) => (
									<View key={p.label} testID={`location-price-${i}`} collapsable={false}>
										<Chip label={p.label} on={priceBandOn(p, filter)} onPress={() => updateFilter({ minPrice: p.min, maxPrice: p.max })} />
									</View>
								))}
							</View>
						</View>
					</View>
				</ScrollView>

				<View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
					<View style={column}>
						<Button
							title="Show homes"
							size="lg"
							block
							onPress={() => {
								commitSearch();
								leave();
							}}
							testID="location-show"
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

const s = StyleSheet.create({
	screen: { flex: 1, backgroundColor: color.bg },
	hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_HEIGHT, overflow: 'hidden' },
	top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: gutter, paddingBottom: 8 },
	body: { paddingHorizontal: gutter, paddingTop: 66, gap: 20 },
	qBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	qInput: { flex: 1, color: color.fg, fontFamily: font.body, fontSize: 16, outlineStyle: 'none' } as object,
	mine: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
	mineIcon: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, alignItems: 'center', justifyContent: 'center' },
	wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	footer: { paddingHorizontal: gutter, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, backgroundColor: color.bg }
});
