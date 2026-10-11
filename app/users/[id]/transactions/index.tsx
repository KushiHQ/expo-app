import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Empty, Header, KText, Pill, Skeleton } from '@/components/k';
import { color, gutter, radius } from '@/lib/k/theme';
import { date, naira } from '@/lib/k/format';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { TransactionType as T, useTransactionsQuery, type TransactionsQuery } from '@/lib/services/graphql/generated';

type Tx = TransactionsQuery['transactions'][number];

const KIND: Record<string, { label: string; incoming: boolean }> = {
	[T.BookingPayment]: { label: 'Rent paid into escrow', incoming: false },
	[T.GuestCancellationRefund]: { label: 'Refund', incoming: true },
	[T.HostBookingPayment]: { label: 'Payout', incoming: true },
	[T.HostCancellationCompensation]: { label: 'Cancellation compensation', incoming: true },
	[T.ListingTierBoost]: { label: 'Listing boost', incoming: false }
};

const STATUS: Record<string, { label: string; tone: 'success' | 'live' | 'danger' | 'neutral' | 'info' }> = {
	SUCCESS: { label: 'Done', tone: 'success' },
	PENDING: { label: 'Pending', tone: 'live' },
	PROCESSING: { label: 'Processing', tone: 'info' },
	NEEDS_RECONCILIATION: { label: 'Processing', tone: 'info' },
	FAILED: { label: 'Failed', tone: 'danger' },
	CANCELLED: { label: 'Cancelled', tone: 'neutral' },
	REFUNDED: { label: 'Refunded', tone: 'neutral' }
};

export default function Payments() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { items, fetching, loadMore, hasNextPage, refresh, showInitialSkeleton, showEmpty } = useInfiniteQuery(useTransactionsQuery, {
		queryKey: 'transactions',
		initialVariables: { filter: { userId: id } },
		limit: 20
	});

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Header eyebrow="You" title="Payments" />
			<FlatList
				data={(items ?? []).filter(Boolean) as Tx[]}
				keyExtractor={(t) => t.id}
				renderItem={({ item }) => <TxRow t={item} />}
				contentContainerStyle={{ padding: gutter, gap: 10, paddingBottom: 48 }}
				onEndReached={() => hasNextPage && !fetching && loadMore()}
				onEndReachedThreshold={0.5}
				onRefresh={refresh}
				refreshing={false}
				ListHeaderComponent={<KText v="small" style={{ paddingBottom: 6 }}>Every naira that moves through Kushi, with its reference. Tap one for the receipt.</KText>}
				ListEmptyComponent={
					showInitialSkeleton ? (
						<View style={{ gap: 10 }}>
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} style={{ height: 76 }} />
							))}
						</View>
					) : showEmpty ? (
						<Empty eyebrow="No payments" title="Nothing paid yet" body="When you pay for a home, the receipt and its reference will live here." />
					) : null
				}
			/>
		</View>
	);
}

function TxRow({ t }: { t: Tx }) {
	const k = KIND[t.type] ?? { label: 'Payment', incoming: false };
	const st = STATUS[t.status] ?? { label: t.status, tone: 'neutral' as const };
	const Icon = k.incoming ? ArrowDownLeft : ArrowUpRight;
	return (
		<Pressable
			onPress={() => router.push({ pathname: '/users/[id]/transactions/[transactionId]', params: { id: '0', transactionId: t.reference || t.id } })}
			style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]}
		>
			<View style={[s.icon, k.incoming && { backgroundColor: color.successSoft }]}>
				<Icon size={17} color={k.incoming ? color.success : color.fg2} />
			</View>
			<View style={{ flex: 1, minWidth: 0, gap: 3 }}>
				<KText v="bodyStrong" numberOfLines={1}>
					{t.booking?.hosting?.title ?? k.label}
				</KText>
				<KText v="xs" numberOfLines={1}>
					{k.label} · {date(t.createdAt)}
				</KText>
			</View>
			<View style={{ alignItems: 'flex-end', gap: 6 }}>
				<KText v="bodyStrong" style={k.incoming ? { color: color.success } : undefined}>
					{k.incoming ? '+' : ''}
					{naira(t.amount)}
				</KText>
				<Pill tone={st.tone}>{st.label}</Pill>
			</View>
		</Pressable>
	);
}

const s = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface }
});
