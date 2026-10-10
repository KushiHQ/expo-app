import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationRow, DECIDABLE } from '@/components/k/host-bits';
import { Empty, PageTitle, Segmented, Skeleton } from '@/components/k';
import { color, gutter } from '@/lib/k/theme';
import { BookingApplicationStatus as S, useKBookingApplicationsQuery } from '@/lib/services/graphql/generated';

export default function Applications() {
	const insets = useSafeAreaInsets();
	const [{ data, fetching }, refetch] = useKBookingApplicationsQuery({ variables: { filter: { authHost: true, excludeStatuses: [S.InProgress] }, pagination: { limit: 200, offset: 0 } }, requestPolicy: 'cache-and-network' });
	const [tab, setTab] = useState<'todo' | 'accepted' | 'closed'>('todo');
	const all = data?.bookingApplications ?? [];
	const groups = useMemo(
		() => ({
			todo: all.filter((a) => DECIDABLE.includes(a.status)),
			accepted: all.filter((a) => a.status === 'ACCEPTED'),
			closed: all.filter((a) => a.status === 'REJECTED' || a.status === 'CANCELLED')
		}),
		[all]
	);
	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				data={fetching && !data ? [] : groups[tab]}
				keyExtractor={(a) => a.id}
				renderItem={({ item }) => <ApplicationRow a={item} />}
				ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
				contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 40 }}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				ListHeaderComponent={
					<View style={{ gap: 16, paddingBottom: 16 }}>
						<PageTitle eyebrow="Hosting" title="Applications" sub="Every applicant has verified their identity with Kushi." />
						<Segmented
							value={tab}
							onChange={setTab}
							options={[
								{ value: 'todo', label: `To review ${groups.todo.length}` },
								{ value: 'accepted', label: `Accepted ${groups.accepted.length}` },
								{ value: 'closed', label: 'Closed' }
							]}
						/>
					</View>
				}
				ListEmptyComponent={
					fetching ? (
						<View style={{ gap: 10 }}>
							{[0, 1].map((i) => (
								<Skeleton key={i} style={{ height: 100 }} />
							))}
						</View>
					) : (
						<Empty eyebrow="All clear" title={tab === 'todo' ? 'No applications waiting' : 'Nothing here yet'} body="Verified renters’ applications for your listings will appear here." />
					)
				}
			/>
		</View>
	);
}
