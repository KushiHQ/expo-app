import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Map, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Button, Chip, Choice, Empty, Eyebrow, IconButton, KText, Logo, Sheet, Skeleton, Spinner } from '@/components/k';
import { ListingCard } from '@/components/k/listing-card';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { centered, itemWidth, useLayout } from '@/lib/k/layout';
import { naira } from '@/lib/k/format';
import { TIERS, TIER_ORDER } from '@/lib/k/tiers';
import { useHostingFilterStore } from '@/lib/stores/hostings';
import { POPULAR_STATES, PRICE_BANDS, WIDEN_BELOW, exploreSummary, nextWidenLevel, priceBandOn, stateLabel, useHostingFilterHydrated, widenFilter, type WidenLevel } from '@/lib/k/explore';
import { useUserStore } from '@/lib/stores/users';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { ListingType, PublishStatus, useHostingsQuery, type HostingFilterInput } from '@/lib/services/graphql/generated';

/** Explore's list query, held until the saved filter is read back so a launch doesn't fetch twice. */
function useExploreHostingsQuery(options: Parameters<typeof useHostingsQuery>[0]) {
	const hydrated = useHostingFilterHydrated();
	return useHostingsQuery({ ...options, pause: options?.pause || !hydrated });
}

export default function Explore() {
	const insets = useSafeAreaInsets();
	const { filter, nearMe, updateFilter, setFilter } = useHostingFilterStore();
	const hydrated = useHostingFilterHydrated();
	const name = useUserStore((s) => s.user.user?.profile?.fullName?.split(' ')[0]);
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const { propertyTypes } = usePropertyTypeConfig();
	const [searchOpen, setSearchOpen] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const list = useRef<FlatList>(null);
	// Tablets: a 2–3 column grid inside a centered max-width column. Phones keep one card per row.
	const layout = useLayout();
	const g = layout.compact ? gutter : layout.gutter;
	const cols = layout.columns;
	const colGap = 24;
	const cardWidth = layout.compact ? undefined : itemWidth(layout.contentWidth - g * 2, cols, colGap);

	// Widening (display only): when the person's filter finds fewer than WIDEN_BELOW homes,
	// Explore drops the area + price (keeping the state), then the state. Their filter stays as
	// they set it, and any change to it starts again from their own search.
	const filterKey = JSON.stringify(filter) + (nearMe ? ':near' : '');
	const [widen, setWiden] = useState<{ key: string; level: WidenLevel; counts: Partial<Record<WidenLevel, number>> }>({ key: '', level: 0, counts: {} });
	const level: WidenLevel = widen.key === filterKey ? widen.level : 0;
	const counts = useMemo(() => (widen.key === filterKey ? widen.counts : {}), [widen, filterKey]);
	const vars = useMemo(() => ({ filters: { ...widenFilter(filter, level), publishStatus: PublishStatus.Live, onSale: true } }), [filter, level]);
	const { items, fetching, error, loadMore, hasNextPage, refresh, setVariables, variables, showInitialSkeleton, showEmpty } = useInfiniteQuery(useExploreHostingsQuery, {
		queryKey: 'hostings',
		initialVariables: vars,
		limit: 12
	});
	useEffect(() => setVariables(vars), [vars, setVariables]);
	// The first page for the current variables has settled (hasNextPage only drops once it arrives).
	const settled = hydrated && !fetching && !error && !hasNextPage && JSON.stringify(variables) === JSON.stringify(vars);
	useEffect(() => {
		if (!settled || items.length >= WIDEN_BELOW) return;
		const next = nextWidenLevel(filter, level);
		if (next === null) return;
		setWiden({ key: filterKey, level: next, counts: { ...counts, [level]: items.length } });
	}, [settled, items.length, filter, level, filterKey, counts]);
	const summary = exploreSummary(filter, nearMe, level, counts);
	useEffect(() => {
		const top = () => list.current?.scrollToOffset({ offset: 0, animated: true });
		EventEmitter.on('scrollToTop:index', top);
		return () => EventEmitter.off('scrollToTop:index', top);
	}, []);

	const active = [filter.minPrice || filter.maxPrice, filter.verificationTier, filter.minRating].filter(Boolean).length;
	const set = (f: Partial<HostingFilterInput>) => updateFilter(f);
	const hour = new Date().getHours();
	const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	const header = (
		<View style={{ gap: 16, paddingBottom: 8 }}>
			<View style={s.top}>
				<Logo height={20} />
				{signedIn ? (
					<IconButton label="Notifications" onPress={() => router.push('/notifications')}>
						<Bell size={18} color={color.fg} />
					</IconButton>
				) : (
					<Button title="Sign in" variant="ghost" size="sm" onPress={() => router.push('/auth/sign-in')} />
				)}
			</View>
			<View style={{ gap: 8 }}>
				<Eyebrow>{name ? `${greet}, ${name}` : 'Kushi Housing · Nigeria'}</Eyebrow>
				<KText v="display">
					Find a home you can <KText v="display" c="amber">trust.</KText>
				</KText>
			</View>
			<Pressable onPress={() => setSearchOpen(true)} style={[s.search, !layout.compact && { maxWidth: 720 }]} accessibilityRole="search" testID="search">
				<Search size={18} color={color.muted} />
				<View style={{ flex: 1 }}>
					<KText v="bodyStrong" numberOfLines={1}>
						{nearMe ? 'Near you' : filter.search || stateLabel(filter.state) || 'Search city or area'}
					</KText>
					<KText v="xs" numberOfLines={1}>
						{filter.listingType === ListingType.Sale ? 'Buying' : filter.listingType === ListingType.Rent ? 'Renting' : 'Rent or buy'} · {filter.propertyType ?? 'Any type'}
					</KText>
				</View>
				{nearMe || filter.search || filter.state ? (
					<Pressable hitSlop={10} onPress={() => set({ search: undefined, state: undefined, city: undefined })} accessibilityLabel="Clear search">
						<X size={18} color={color.muted} />
					</Pressable>
				) : null}
			</Pressable>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: g }} style={{ marginHorizontal: -g }} contentInset={{ left: g }}>
				<View style={{ width: g - 8 }} />
				<Chip
					label={active ? `Filters · ${active}` : 'Filters'}
					on={!!active}
					onPress={() => setFiltersOpen(true)}
					icon={<SlidersHorizontal size={15} color={active ? color.amber : color.fg2} />}
				/>
				<Chip label="For rent" on={filter.listingType === ListingType.Rent} onPress={() => set({ listingType: filter.listingType === ListingType.Rent ? undefined : ListingType.Rent })} />
				<Chip label="For sale" on={filter.listingType === ListingType.Sale} onPress={() => set({ listingType: filter.listingType === ListingType.Sale ? undefined : ListingType.Sale })} />
				{propertyTypes.slice(0, 8).map((p) => (
					<Chip key={p.value} label={p.label} on={filter.propertyType === p.value} onPress={() => set({ propertyType: filter.propertyType === p.value ? undefined : p.value })} />
				))}
			</ScrollView>
			{summary ? (
				<KText v="small" testID="explore-summary">
					{summary}
				</KText>
			) : null}
		</View>
	);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				ref={list}
				key={`grid-${cols}`}
				numColumns={cols}
				columnWrapperStyle={cols > 1 ? { gap: colGap } : undefined}
				data={showInitialSkeleton || !hydrated ? [] : items}
				keyExtractor={(h) => h.id}
				renderItem={({ item }) => <ListingCard h={item} width={cardWidth} />}
				ListHeaderComponent={header}
				ItemSeparatorComponent={() => <View style={{ height: layout.compact ? 28 : 36 }} />}
				contentContainerStyle={layout.compact ? { paddingHorizontal: gutter, paddingBottom: 110, gap: 0 } : [{ paddingHorizontal: g, paddingBottom: 110, paddingTop: 8 }, centered(layout.contentWidth)]}
				onEndReached={() => hasNextPage && loadMore()}
				onEndReachedThreshold={0.6}
				refreshing={false}
				onRefresh={refresh}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					showInitialSkeleton || !hydrated ? (
						<View style={layout.compact ? { gap: 28 } : { flexDirection: 'row', flexWrap: 'wrap', gap: colGap, rowGap: 36 }}>
							{(layout.compact ? [0, 1] : Array.from({ length: cols * 2 }, (_, i) => i)).map((i) => (
								<View key={i} style={[{ gap: 10 }, cardWidth ? { width: cardWidth } : null]}>
									<Skeleton style={{ height: cardWidth ? Math.round(cardWidth * 0.72) : 250, borderRadius: radius.lg }} />
									<Skeleton style={{ height: 16, width: '60%' }} />
									<Skeleton style={{ height: 14, width: '40%' }} />
								</View>
							))}
						</View>
					) : showEmpty ? (
						<Empty
							title="No homes found"
							body="No homes match yet. Widen your search or clear filters — new verified homes are added every week."
							action={Object.keys(filter).length ? 'Clear search & filters' : undefined}
							onAction={() => setFilter({})}
						/>
					) : null
				}
				ListFooterComponent={fetching && items.length > 0 ? <View style={{ paddingVertical: 24 }}><Spinner /></View> : null}
			/>

			<Pressable onPress={() => router.push('/map')} style={s.mapBtn} accessibilityRole="button" accessibilityLabel="Show map">
				<Map size={16} color={color.bg} />
				<KText style={{ fontFamily: font.bodySemi, color: color.bg, fontSize: 14 }}>Map</KText>
			</Pressable>

			<SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />

			<Sheet
				open={filtersOpen}
				onClose={() => setFiltersOpen(false)}
				title="Filters"
				footer={
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title="Clear" variant="ghost" onPress={() => set({ minPrice: undefined, maxPrice: undefined, verificationTier: undefined, minRating: undefined })} />
						<Button title="Show homes" style={{ flex: 1 }} onPress={() => setFiltersOpen(false)} />
					</View>
				}
			>
				<KText v="label">Price</KText>
				<View style={s.wrap}>
					{PRICE_BANDS.map((p) => (
						<Chip key={p.label} label={p.label} on={priceBandOn(p, filter)} onPress={() => set({ minPrice: p.min, maxPrice: p.max })} />
					))}
				</View>
				<KText v="label">How verified</KText>
				{TIER_ORDER.slice(1).map((t) => (
					<Choice key={t} title={`${TIERS[t].label} or higher`} detail={TIERS[t].what} on={filter.verificationTier === t} onPress={() => set({ verificationTier: filter.verificationTier === t ? undefined : t })} />
				))}
				<KText v="label">Rating</KText>
				<View style={s.wrap}>
					{[0, 3, 4].map((r) => (
						<Chip key={r} label={r ? `${r}★ & up` : 'Any'} on={(filter.minRating ?? 0) === r} onPress={() => set({ minRating: r || undefined })} />
					))}
				</View>
				{filter.minPrice || filter.maxPrice ? (
					<KText v="xs">
						{filter.minPrice ? `From ${naira(Number(filter.minPrice))}` : ''} {filter.maxPrice ? `up to ${naira(Number(filter.maxPrice))}` : ''}
					</KText>
				) : null}
			</Sheet>
		</View>
	);
}

/** Search: free text (area, estate, landmark) + popular states. */
function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { filter, updateFilter } = useHostingFilterStore();
	const [q, setQ] = useState(filter.search ?? '');
	useEffect(() => {
		if (open) setQ(filter.search ?? '');
	}, [open, filter.search]);
	const go = (search?: string, state?: string) => {
		updateFilter({ search: search?.trim() || undefined, state });
		onClose();
	};
	return (
		<Sheet open={open} onClose={onClose} title="Search">
			<View style={s.qBox}>
				<Search size={18} color={color.muted} />
				<TextInput
					value={q}
					onChangeText={setQ}
					autoFocus
					placeholder="Area, estate or landmark — e.g. Wuse 2"
					placeholderTextColor={color.dim}
					returnKeyType="search"
					onSubmitEditing={() => go(q, undefined)}
					style={s.qInput}
					testID="search-input"
				/>
			</View>
			<Button title={q.trim() ? `Search “${q.trim()}”` : 'Show all homes'} block onPress={() => go(q, undefined)} />
			<KText v="label">Popular states</KText>
			<View style={s.wrap}>
				{POPULAR_STATES.map((st) => (
					<Chip key={st} label={stateLabel(st)} on={filter.state === st} onPress={() => go(undefined, filter.state === st ? undefined : st)} />
				))}
			</View>
		</Sheet>
	);
}

const s = StyleSheet.create({
	top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 },
	search: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 62, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	mapBtn: { position: 'absolute', bottom: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 44, borderRadius: radius.pill, backgroundColor: color.fg },
	qBox: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.amber, backgroundColor: color.bg },
	qInput: { flex: 1, color: color.fg, fontFamily: font.body, fontSize: 16, outlineStyle: 'none' } as object
});
