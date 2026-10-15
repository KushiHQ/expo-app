import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Empty, KText, Notice, PageTitle, Segmented, SignedOut, Skeleton } from '@/components/k';
import { ListingCard } from '@/components/k/listing-card';
import { CollectButton, CollectionNameSheet, CollectionsStrip, MoveSheet, useCollections, useSavedItems, type SavedItem } from '@/components/k/collections';
import { color, gutter, radius } from '@/lib/k/theme';
import { centered, itemWidth, useLayout } from '@/lib/k/layout';
import { useUserStore } from '@/lib/stores/users';

/** Saved homes, with collections on top. */
export default function Saved() {
	const insets = useSafeAreaInsets();
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const { items: all, fetching, error, loaded, reload } = useSavedItems(undefined, !signedIn);
	const { collections, reload: reloadCollections } = useCollections(!signedIn);
	const [sort, setSort] = useState<'recent' | 'low' | 'high'>('recent');
	const [moving, setMoving] = useState<SavedItem | null>(null);
	const [creating, setCreating] = useState(false);
	// Tablets: the same grid as Explore. Phones keep one card per row.
	const layout = useLayout();
	const cols = layout.columns;
	const colGap = 24;
	const cardWidth = layout.compact ? undefined : itemWidth(layout.contentWidth - layout.gutter * 2, cols, colGap);
	const items = useMemo(
		() => [...all].sort((a, b) => (sort === 'recent' ? (b.createdAt ?? '').localeCompare(a.createdAt ?? '') : sort === 'low' ? (a.hosting.price ?? 0) - (b.hosting.price ?? 0) : (b.hosting.price ?? 0) - (a.hosting.price ?? 0))),
		[all, sort]
	);
	const refresh = () => {
		reload();
		reloadCollections();
	};

	if (!signedIn)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
				<View style={[{ flex: 1, justifyContent: 'center', paddingHorizontal: gutter }, centered(layout.max('form'))]}>
					<SignedOut eyebrow="Saved" title="Keep homes on your map" body="Tap the heart on any home to save it. Sign in so your saved homes follow you everywhere." />
				</View>
			</View>
		);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				key={`grid-${cols}`}
				testID="saved-list"
				numColumns={cols}
				columnWrapperStyle={cols > 1 ? { gap: colGap } : undefined}
				data={!loaded ? [] : items}
				keyExtractor={(s) => s.id}
				renderItem={({ item }) => (
					<View>
						<ListingCard h={item.hosting} width={cardWidth} />
						<CollectButton inCollection={!!item.folder} onPress={() => setMoving(item)} />
					</View>
				)}
				ItemSeparatorComponent={() => <View style={{ height: layout.compact ? 28 : 36 }} />}
				contentContainerStyle={layout.compact ? { paddingHorizontal: gutter, paddingBottom: 40 } : [{ paddingHorizontal: layout.gutter, paddingBottom: 40 }, centered(layout.contentWidth)]}
				onRefresh={refresh}
				refreshing={false}
				ListHeaderComponent={
					<View style={{ gap: 16, paddingBottom: 20 }}>
						<PageTitle eyebrow="Saved" title="Homes on your map" sub={items.length ? `${items.length} home${items.length === 1 ? '' : 's'}` : undefined} />
						{loaded ? (
							<View style={{ gap: 10 }}>
								<KText v="label">Collections</KText>
								<CollectionsStrip collections={collections} onNew={() => setCreating(true)} />
							</View>
						) : null}
						{error && loaded ? (
							<Notice tone="warn" action="Try again" onAction={refresh}>
								Couldn’t refresh your saved homes.
							</Notice>
						) : null}
						{items.length > 1 ? (
							<Segmented
								value={sort}
								onChange={setSort}
								options={[
									{ value: 'recent', label: 'Recent' },
									{ value: 'low', label: 'Price ↑' },
									{ value: 'high', label: 'Price ↓' }
								]}
							/>
						) : null}
					</View>
				}
				ListEmptyComponent={
					fetching && !loaded ? (
						<View style={{ gap: 10 }}>
							<Skeleton style={{ height: 250, borderRadius: radius.lg }} />
							<Skeleton style={{ height: 16, width: '55%' }} />
						</View>
					) : error && !loaded ? (
						<Notice tone="danger" title="Couldn’t load your saved homes" action="Try again" onAction={refresh}>
							Check your connection and try again.
						</Notice>
					) : (
						<Empty eyebrow="Nothing pinned" title="Save homes as you explore" body="Compare them here later, or come back when you’re ready to apply." action="Explore homes" onAction={() => router.navigate('/')} />
					)
				}
			/>
			<MoveSheet item={moving} collections={collections} onClose={() => setMoving(null)} />
			<CollectionNameSheet open={creating} onClose={() => setCreating(false)} onSaved={(id) => router.push(`/hostings/folders/${id}`)} />
		</View>
	);
}
