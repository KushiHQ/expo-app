import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react-native';
import { Empty, Header, KText, Notice, Pill, Skeleton, Spinner } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, radius } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { naira } from '@/lib/k/format';
import { cleanError, monthOf, moneyState, shortDate, txKind, usePaymentsQuery, type PaymentRow } from '@/lib/k/account';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { useUserStore } from '@/lib/stores/users';

/** Money history: every payment, refund and payout with where the money is now. */
export default function Payments() {
	const userId = useUserStore((s) => s.user.user?.id) ?? '';
	const layout = useLayout();
	const column = centered(layout.max('reading'));
	const { items, fetching, error, loadMore, hasNextPage, refresh, showInitialSkeleton } = useInfiniteQuery(usePaymentsQuery, {
		queryKey: 'transactions',
		initialVariables: { filter: { userId } },
		limit: 25,
		requestPolicy: 'cache-and-network'
	});
	const rows = useMemo(() => (items ?? []).filter(Boolean) as PaymentRow[], [items]);

	const sections = useMemo(() => {
		const map = new Map<string, PaymentRow[]>();
		for (const t of rows) {
			const k = monthOf(t.createdAt);
			map.set(k, [...(map.get(k) ?? []), t]);
		}
		return [...map.entries()].map(([title, data]) => ({ title, data }));
	}, [rows]);

	const escrow = rows.filter((t) => moneyState(t).key === 'escrow').reduce((sum, t) => sum + Number(t.amount || 0), 0);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Header eyebrow="You" title="Payments & receipts" />
			<SectionList
				sections={sections}
				keyExtractor={(t) => t.id}
				stickySectionHeadersEnabled={false}
				contentContainerStyle={[{ paddingHorizontal: layout.gutter, paddingBottom: 48 }, column]}
				onEndReached={() => hasNextPage && !fetching && loadMore()}
				onEndReachedThreshold={0.4}
				onRefresh={refresh}
				refreshing={false}
				ListHeaderComponent={
					<View style={{ gap: 14, paddingTop: 18, paddingBottom: 4 }}>
						<View style={s.explain}>
							<ShieldCheck size={20} color={color.amber} />
							<View style={{ flex: 1, gap: 4 }}>
								<KText v="smallStrong">How Kushi holds your money</KText>
								<KText v="xs">Rent you pay sits in escrow. The host is paid only after you confirm your move-in, or automatically 14 days after payment if you don’t raise a problem.</KText>
							</View>
						</View>
						{escrow > 0 ? (
							<View style={s.total} accessible accessibilityLabel={`Held in escrow for you: ${naira(escrow)}`}>
								<KText v="label">Held in escrow for you</KText>
								<KText v="money">{naira(escrow)}</KText>
							</View>
						) : null}
						{error && !rows.length ? (
							<Notice tone="danger" title="Couldn’t load your payments" action="Try again" onAction={refresh}>
								{cleanError(error.message)}
							</Notice>
						) : null}
					</View>
				}
				renderSectionHeader={({ section }) => (
					<KText v="label" style={{ paddingTop: 18, paddingBottom: 8 }}>
						{section.title}
					</KText>
				)}
				renderItem={({ item }) => <PaymentItem t={item} />}
				ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
				ListEmptyComponent={
					showInitialSkeleton || (fetching && !rows.length) ? (
						<View style={{ gap: 10, paddingTop: 18 }}>
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} style={{ height: 76 }} />
							))}
						</View>
					) : error ? null : (
						<Empty eyebrow="No payments" title="Nothing paid yet" body="When you pay for a home, the receipt and its reference live here — along with where the money is." />
					)
				}
				ListFooterComponent={fetching && rows.length ? <View style={{ paddingVertical: 16 }}><Spinner /></View> : null}
			/>
		</View>
	);
}

function PaymentItem({ t }: { t: PaymentRow }) {
	const k = txKind(t.type);
	const st = moneyState(t);
	const Icon = k.incoming ? ArrowDownLeft : ArrowUpRight;
	const ref = t.reference || t.id;
	return (
		<Pressable
			testID="payment-row"
			accessibilityRole="button"
			accessibilityLabel={`${t.booking?.hosting?.title ?? k.label}, ${k.incoming ? 'received' : 'paid'} ${naira(Number(t.amount))} on ${shortDate(t.createdAt)}. ${st.label}`}
			onPress={() => router.push({ pathname: '/account/payments/[ref]', params: { ref } })}
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
					{t.booking?.hosting?.title ? `${k.label} · ${shortDate(t.createdAt)}` : shortDate(t.createdAt)}
				</KText>
			</View>
			<View style={{ alignItems: 'flex-end', gap: 6 }}>
				<KText v="bodyStrong" style={k.incoming ? { color: color.success } : undefined}>
					{k.incoming ? '+' : ''}
					{naira(Number(t.amount))}
				</KText>
				<Pill tone={st.tone}>{st.label}</Pill>
			</View>
		</Pressable>
	);
}

const s = StyleSheet.create({
	explain: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.amberLine, backgroundColor: 'rgba(245,158,11,0.05)' },
	total: { gap: 6, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface }
});
