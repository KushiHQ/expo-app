import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Empty, PageTitle, Segmented, SignedOut, Skeleton } from '@/components/k';
import { ListingCard, type CardHosting } from '@/components/k/listing-card';
import { color, gutter, radius } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { useKSavedQuery } from '@/lib/services/graphql/generated';

export default function Saved() {
	const insets = useSafeAreaInsets();
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const [{ data, fetching }, refetch] = useKSavedQuery({ variables: { pagination: { limit: 200, offset: 0 } }, pause: !signedIn, requestPolicy: 'cache-and-network' });
	const [sort, setSort] = useState<'recent' | 'low' | 'high'>('recent');
	const items = useMemo(
		() =>
			[...(data?.savedHostings ?? [])]
				.filter((s) => s.hosting && s.hosting.saved !== false)
				.sort((a, b) => (sort === 'recent' ? (b.createdAt ?? '').localeCompare(a.createdAt ?? '') : sort === 'low' ? (a.hosting.price ?? 0) - (b.hosting.price ?? 0) : (b.hosting.price ?? 0) - (a.hosting.price ?? 0))),
		[data, sort]
	);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			{!signedIn ? (
				<View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: gutter }}>
					<SignedOut eyebrow="Saved" title="Keep homes on your map" body="Tap the heart on any home to save it. Sign in so your saved homes follow you everywhere." />
				</View>
			) : (
				<FlatList
					data={fetching && !data ? [] : items}
					keyExtractor={(s) => s.id}
					renderItem={({ item }) => <ListingCard h={item.hosting as unknown as CardHosting} />}
					ItemSeparatorComponent={() => <View style={{ height: 28 }} />}
					contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 40 }}
					onRefresh={() => refetch({ requestPolicy: 'network-only' })}
					refreshing={false}
					ListHeaderComponent={
						<View style={{ gap: 16, paddingBottom: 20 }}>
							<PageTitle eyebrow="Saved" title="Homes on your map" sub={items.length ? `${items.length} home${items.length === 1 ? '' : 's'}` : undefined} />
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
						fetching ? (
							<View style={{ gap: 10 }}>
								<Skeleton style={{ height: 250, borderRadius: radius.lg }} />
								<Skeleton style={{ height: 16, width: '55%' }} />
							</View>
						) : (
							<Empty eyebrow="Nothing pinned" title="Save homes as you explore" body="Compare them here later, or come back when you’re ready to apply." action="Explore homes" onAction={() => router.navigate('/')} />
						)
					}
				/>
			)}
		</View>
	);
}
