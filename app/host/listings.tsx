import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { HostListingRow } from '@/components/k/host-bits';
import { Button, Empty, PageTitle, Segmented, Skeleton } from '@/components/k';
import { color, gutter } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { useHostListingsQuery } from '@/lib/services/graphql/generated';

export default function Listings() {
	const insets = useSafeAreaInsets();
	const me = useUserStore((s) => s.user.user?.id);
	const [{ data, fetching }, refetch] = useHostListingsQuery({ variables: { filters: { creatorId: me }, pagination: { limit: 200, offset: 0 } }, pause: !me, requestPolicy: 'cache-and-network' });
	const [tab, setTab] = useState<'all' | 'LIVE' | 'INREVIEW' | 'DRAFT'>('all');
	const all = data?.hostings ?? [];
	const list = useMemo(() => all.filter((l) => tab === 'all' || (l.publishStatus ?? 'DRAFT') === tab), [all, tab]);
	const count = (s: string) => all.filter((l) => (l.publishStatus ?? 'DRAFT') === s).length;

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				data={fetching && !data ? [] : list}
				keyExtractor={(l) => l.id}
				renderItem={({ item }) => <HostListingRow l={item} />}
				ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
				contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 40 }}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				ListHeaderComponent={
					<View style={{ gap: 16, paddingBottom: 16 }}>
						<PageTitle eyebrow="Hosting" title="Listings" right={<Button title="New" size="sm" icon={<Plus size={15} color={color.onAmber} />} onPress={() => router.push('/hostings/form')} />} />
						{all.length ? (
							<Segmented
								value={tab}
								onChange={setTab}
								options={[
									{ value: 'all', label: `All ${all.length}` },
									{ value: 'LIVE', label: `Live ${count('LIVE')}` },
									{ value: 'INREVIEW', label: `Review ${count('INREVIEW')}` },
									{ value: 'DRAFT', label: `Drafts ${count('DRAFT')}` }
								]}
							/>
						) : null}
					</View>
				}
				ListEmptyComponent={
					fetching ? (
						<View style={{ gap: 10 }}>
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} style={{ height: 92 }} />
							))}
						</View>
					) : (
						<Empty eyebrow={all.length ? 'None here' : 'No listings yet'} title={all.length ? 'Nothing in this view' : 'Put your first property on the map'} body={all.length ? undefined : 'Listing is free. Kushi verifies it, brings verified renters and handles the agreement and escrow.'} action={all.length ? undefined : 'Create a listing'} onAction={() => router.push('/hostings/form')} />
					)
				}
			/>
		</View>
	);
}
