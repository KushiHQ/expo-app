/**
 * The host's applications board: To review · Accepted · Closed, optionally for
 * one listing. Phones open a row full-screen; tablets (≥ 900dp) show the list
 * and the selected application side by side.
 */
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationRow, DECIDABLE } from './host-bits';
import { ApplicationReview } from './application-review';
import { Chip, Segmented, Skeleton } from './surface';
import { Empty, Notice } from './feedback';
import { Header, PageTitle } from './layout';
import { KText } from './text';
import { color, gutter } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { BookingApplicationStatus as S, useKBookingApplicationsQuery } from '@/lib/services/graphql/generated';

type Tab = 'todo' | 'accepted' | 'closed';

export function ApplicationsBoard({ listingId, listingTitle }: { listingId?: string; listingTitle?: string }) {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const split = layout.expanded;
	const [{ data, fetching, error }, refetch] = useKBookingApplicationsQuery({
		variables: { filter: { authHost: true, excludeStatuses: [S.InProgress], ...(listingId ? { hostingId: listingId } : {}) }, pagination: { limit: 200, offset: 0 } },
		requestPolicy: 'cache-and-network'
	});
	const [tab, setTab] = useState<Tab>('todo');
	const [only, setOnly] = useState<string | null>(null);
	const [selected, setSelected] = useState<string | null>(null);
	const all = useMemo(() => data?.bookingApplications ?? [], [data]);
	const listings = useMemo(() => {
		const m = new Map<string, string>();
		for (const a of all) if (!m.has(a.hosting.id)) m.set(a.hosting.id, a.hosting.title ?? 'Listing');
		return [...m.entries()];
	}, [all]);
	const scoped = useMemo(() => (only ? all.filter((a) => a.hosting.id === only) : all), [all, only]);
	const groups = useMemo(
		() => ({
			todo: scoped.filter((a) => DECIDABLE.includes(a.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
			accepted: scoped.filter((a) => a.status === 'ACCEPTED').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
			closed: scoped.filter((a) => a.status === 'REJECTED' || a.status === 'CANCELLED').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		}),
		[scoped]
	);
	const rows = groups[tab];
	// Tablets keep a selection; land on the first row of the tab.
	useEffect(() => {
		if (!split) return;
		if (!rows.length) setSelected(null);
		else if (!rows.some((r) => r.id === selected)) setSelected(rows[0].id);
	}, [split, rows, selected]);
	const reload = () => refetch({ requestPolicy: 'network-only' });

	const header = (
		<View style={{ gap: 16, paddingBottom: 16 }}>
			{listingId ? (
				<KText v="small">{listingTitle ? `Applications for ${listingTitle}.` : 'Applications for this listing.'} Every applicant has verified their identity with Kushi.</KText>
			) : (
				<PageTitle eyebrow="Hosting" title="Applications" sub="Every applicant has verified their identity with Kushi." />
			)}
			<Segmented
				value={tab}
				onChange={setTab}
				options={[
					{ value: 'todo', label: `To review ${groups.todo.length}` },
					{ value: 'accepted', label: `Accepted ${groups.accepted.length}` },
					{ value: 'closed', label: 'Closed' }
				]}
			/>
			{!listingId && listings.length > 1 ? (
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
					<Chip label="All listings" on={!only} onPress={() => setOnly(null)} />
					{listings.map(([id, title]) => (
						<Chip key={id} label={title} on={only === id} onPress={() => setOnly(only === id ? null : id)} />
					))}
				</ScrollView>
			) : null}
			{error && data ? (
				<Notice tone="warn" action="Try again" onAction={reload}>
					Showing what we had. We couldn’t refresh just now.
				</Notice>
			) : null}
		</View>
	);

	const empty =
		fetching && !data ? (
			<View style={{ gap: 10 }}>
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} style={{ height: 100 }} />
				))}
			</View>
		) : error && !data ? (
			<Notice tone="danger" title="Couldn’t load applications" action="Try again" onAction={reload}>
				Check your connection and try again.
			</Notice>
		) : (
			<Empty
				eyebrow="All clear"
				title={tab === 'todo' ? 'No applications waiting' : tab === 'accepted' ? 'No accepted renters yet' : 'Nothing closed yet'}
				body={tab === 'todo' ? 'When a verified renter applies, they appear here and we notify you.' : undefined}
			/>
		);

	const list = (
		<FlatList
			testID="applications-list"
			data={fetching && !data ? [] : rows}
			keyExtractor={(a) => a.id}
			renderItem={({ item }) => <ApplicationRow a={item} selected={split && item.id === selected} onPress={split ? () => setSelected(item.id) : undefined} />}
			ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
			contentContainerStyle={[{ paddingHorizontal: split ? layout.gutter : gutter, paddingBottom: 40, paddingTop: listingId ? 16 : 0 }, split ? null : centered(layout.max('reading'))]}
			onRefresh={reload}
			refreshing={false}
			ListHeaderComponent={header}
			ListEmptyComponent={empty}
		/>
	);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: listingId ? 0 : insets.top }}>
			{listingId ? <Header eyebrow="Listing" title="Applications" onBack={() => (router.canGoBack() ? router.back() : router.replace('/host/listings'))} /> : null}
			{split ? (
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<View style={s.listPane}>{list}</View>
					<View style={{ flex: 1 }}>
						{selected ? (
							<ApplicationReview key={selected} id={selected} embedded onChanged={reload} />
						) : (
							<View style={{ flex: 1, justifyContent: 'center' }}>
								<Empty eyebrow="Applications" title="Pick an application" body="Choose someone on the left to see their details and decide." />
							</View>
						)}
					</View>
				</View>
			) : (
				list
			)}
		</View>
	);
}

const s = StyleSheet.create({
	listPane: { width: 400, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: color.line }
});
