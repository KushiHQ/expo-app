import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { ArrowLeft, List, LocateFixed } from 'lucide-react-native';
import { IconButton, KText, Photo, Spinner } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { naira, nairaCompact, perInterval, place } from '@/lib/k/format';
import { useHostingFilterStore } from '@/lib/stores/hostings';
import { PublishStatus, useHostingsQuery, type HostingsQuery } from '@/lib/services/graphql/generated';

type H = HostingsQuery['hostings'][number];

// Centre of Nigeria-wide view when we have nothing better.
const NIGERIA: Region = { latitude: 8.6, longitude: 7.9, latitudeDelta: 9, longitudeDelta: 9 };

export default function MapScreen() {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const cardW = width - 64;
	const map = useRef<MapView>(null);
	const list = useRef<FlatList<H>>(null);
	const { filter } = useHostingFilterStore();
	const [{ data, fetching }] = useHostingsQuery({
		variables: { filters: { ...filter, publishStatus: PublishStatus.Live, onSale: true }, pagination: { limit: 150, offset: 0 } },
		requestPolicy: 'cache-and-network'
	});
	const homes = useMemo(
		() => (data?.hostings ?? []).filter((h) => Number.isFinite(Number(h.latitude)) && Number.isFinite(Number(h.longitude)) && Number(h.latitude) !== 0),
		[data]
	);
	const [selected, setSelected] = useState<string | null>(null);
	const [locating, setLocating] = useState(false);

	// Frame every home once results arrive.
	useEffect(() => {
		if (!homes.length) return;
		const t = setTimeout(
			() =>
				map.current?.fitToCoordinates(
					homes.map((h) => ({ latitude: Number(h.latitude), longitude: Number(h.longitude) })),
					{ edgePadding: { top: insets.top + 90, right: 50, bottom: 260, left: 50 }, animated: true }
				),
			300
		);
		return () => clearTimeout(t);
	}, [homes, insets.top]);

	function focus(h: H, scrollCard = true) {
		setSelected(h.id);
		map.current?.animateCamera({ center: { latitude: Number(h.latitude), longitude: Number(h.longitude) } }, { duration: 350 });
		if (scrollCard) {
			const i = homes.findIndex((x) => x.id === h.id);
			if (i >= 0) list.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
		}
	}

	async function locate() {
		setLocating(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const at = await Location.getCurrentPositionAsync({});
			map.current?.animateToRegion({ latitude: at.coords.latitude, longitude: at.coords.longitude, latitudeDelta: 0.12, longitudeDelta: 0.12 }, 500);
		} catch {
			// Location is optional; the map still works without it.
		} finally {
			setLocating(false);
		}
	}

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<MapView
				ref={map}
				style={StyleSheet.absoluteFill}
				provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
				userInterfaceStyle="dark"
				customMapStyle={NIGHT_STYLE}
				initialRegion={NIGERIA}
				showsUserLocation
				showsMyLocationButton={false}
				toolbarEnabled={false}
				onPress={(e) => e.nativeEvent.action !== 'marker-press' && setSelected(null)}
			>
				{homes.map((h) => {
					const on = h.id === selected;
					const price = h.kind === 'PARENT' && h.priceFrom ? h.priceFrom : h.price;
					return (
						<Marker
							key={h.id}
							coordinate={{ latitude: Number(h.latitude), longitude: Number(h.longitude) }}
							onPress={() => focus(h)}
							tracksViewChanges={Platform.OS === 'ios' || on}
							zIndex={on ? 10 : 1}
						>
							<View style={[s.pin, on && s.pinOn]}>
								<KText style={{ fontFamily: font.bodyBold, fontSize: 12, color: on ? color.onAmber : color.fg }}>{nairaCompact(price)}</KText>
							</View>
						</Marker>
					);
				})}
			</MapView>

			<View style={[s.top, { top: insets.top + 10 }]}>
				<IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
					<ArrowLeft size={18} color={color.fg} />
				</IconButton>
				<View style={s.count}>
					{fetching && !data ? (
						<Spinner />
					) : (
						<KText v="smallStrong">
							{homes.length} {homes.length === 1 ? 'home' : 'homes'} on the map
						</KText>
					)}
				</View>
				<IconButton label="Find me" onPress={locate}>
					{locating ? <Spinner /> : <LocateFixed size={18} color={color.fg} />}
				</IconButton>
			</View>

			<View style={[s.bottom, { paddingBottom: insets.bottom + 12 }]}>
				{homes.length ? (
					<FlatList
						ref={list}
						data={homes}
						horizontal
						keyExtractor={(h) => h.id}
						showsHorizontalScrollIndicator={false}
						snapToInterval={cardW + 12}
						decelerationRate="fast"
						contentContainerStyle={{ paddingHorizontal: 32, gap: 12 }}
						getItemLayout={(_, i) => ({ length: cardW + 12, offset: 32 + i * (cardW + 12), index: i })}
						onMomentumScrollEnd={(e) => {
							const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + 12));
							const h = homes[i];
							if (h && h.id !== selected) focus(h, false);
						}}
						renderItem={({ item }) => <MapCard h={item} width={cardW} on={item.id === selected} />}
					/>
				) : !fetching ? (
					<View style={[s.card, { marginHorizontal: 32, padding: 16 }]}>
						<KText v="small">No homes with a map location match your search yet.</KText>
					</View>
				) : null}
				<Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.listBtn} accessibilityRole="button" accessibilityLabel="Show list">
					<List size={16} color={color.bg} />
					<KText v="smallStrong" style={{ color: color.bg }}>
						List
					</KText>
				</Pressable>
			</View>
		</View>
	);
}

function MapCard({ h, width, on }: { h: H; width: number; on: boolean }) {
	const parent = h.kind === 'PARENT';
	const price = parent && h.priceFrom ? h.priceFrom : h.price;
	return (
		<Pressable onPress={() => router.push(`/hostings/${h.id}`)} style={[s.card, { width }, on && { borderColor: color.amber }]}>
			<Photo assetId={h.coverImage?.asset?.id} uri={h.coverImage?.asset?.id ? undefined : null} w={300} h={300} radius={radius.md} style={{ width: 88, height: 88 }} />
			<View style={{ flex: 1, gap: 3, justifyContent: 'center' }}>
				<KText v="bodyStrong" numberOfLines={1}>
					{h.title}
				</KText>
				<KText v="xs" numberOfLines={1}>
					{place(h.city, h.state) || 'Nigeria'}
				</KText>
				<KText v="small" c="fg" numberOfLines={1}>
					{parent && h.priceFrom ? 'from ' : ''}
					<KText style={{ fontFamily: font.bodyBold, color: color.fg }}>{naira(price)}</KText>
					{h.listingType === 'SALE' ? '' : ` ${perInterval(h.paymentInterval)}`}
				</KText>
			</View>
		</Pressable>
	);
}

const s = StyleSheet.create({
	top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
	count: { flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: 'rgba(12,14,19,0.92)', borderWidth: 1, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	pin: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: color.bg2, borderWidth: 1, borderColor: color.line2 },
	pinOn: { backgroundColor: color.amber, borderColor: color.amber, transform: [{ scale: 1.08 }] },
	bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: 14, alignItems: 'stretch' },
	card: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: radius.lg, backgroundColor: color.bg2, borderWidth: 1, borderColor: color.line2 },
	listBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 44, borderRadius: radius.pill, backgroundColor: color.fg }
});

// Google Maps night style matched to the Kushi night palette (Android). iOS uses the system dark map.
const NIGHT_STYLE = [
	{ elementType: 'geometry', stylers: [{ color: '#0c0e13' }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: '#7d8494' }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: '#07080b' }] },
	{ featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#262a33' }] },
	{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1d24' }] },
	{ featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#262a33' }] },
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#05070a' }] }
];
