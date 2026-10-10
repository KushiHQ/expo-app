import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Wallet } from 'lucide-react-native';
import { Empty, KText, PageTitle, Photo, Pill, Screen, SignedOut, Skeleton } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { date, duration, naira, place, relative } from '@/lib/k/format';
import { JOURNEY, STAGE, progress, stageOf, type Stage } from '@/lib/k/journey';
import { useUserStore } from '@/lib/stores/users';
import { useKBookingApplicationsQuery, useKBookingsQuery } from '@/lib/services/graphql/generated';

type Item = { id: string; title: string; where: string; assetId?: string | null; stage: Stage; start?: string | null; length: string; amount?: number | null; updated: string; pay?: { bkId: string; ref: string } };

export default function Trips() {
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const [apps, refetchApps] = useKBookingApplicationsQuery({ variables: { filter: { authGuest: true }, pagination: { limit: 100, offset: 0 } }, pause: !signedIn, requestPolicy: 'cache-and-network' });
	const [bks, refetchBks] = useKBookingsQuery({ variables: { pagination: { limit: 100, offset: 0 } }, pause: !signedIn, requestPolicy: 'cache-and-network' });

	const items = useMemo<Item[]>(() => {
		const byApp = new Map((bks.data?.bookings ?? []).map((b) => [b.bookingApplication?.id, b]));
		return (apps.data?.bookingApplications ?? [])
			.map((a) => {
				const b = byApp.get(a.id);
				const stage = stageOf({ appStatus: a.status, paymentStatus: b?.paymentStatus, bookingStatus: b?.status });
				return {
					id: a.id,
					title: a.hosting.title ?? 'Home',
					where: place(a.hosting.city, a.hosting.state),
					assetId: a.hosting.coverImage?.asset?.id,
					stage,
					start: b?.commencementDate ?? a.commencementDate,
					length: duration(a.intervalMultiplier ?? 1, a.hosting.paymentInterval ?? 'ANUALLY'),
					amount: b?.amount,
					updated: b?.createdAt ?? a.createdAt,
					pay: stage === 'accepted' && b?.transaction?.reference ? { bkId: b.id, ref: b.transaction.reference } : undefined
				};
			})
			.sort((x, y) => (y.updated ?? '').localeCompare(x.updated ?? ''));
	}, [apps.data, bks.data]);

	const ORDER: Stage[] = ['accepted', 'paid', 'review', 'draft'];
	const active = items.filter((i) => ORDER.includes(i.stage)).sort((a, b) => ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage));
	const homes = items.filter((i) => i.stage === 'completed');
	const past = items.filter((i) => i.stage === 'ended');
	const loading = (apps.fetching || bks.fetching) && !apps.data;

	if (!signedIn)
		return (
			<Screen tabbed scroll={false} contentStyle={{ justifyContent: 'center' }}>
				<SignedOut eyebrow="Your homes" title="Track every step to your keys" body="Applications, payments and the homes you live in — all in one place once you sign in." />
			</Screen>
		);

	const group = (label: string, list: Item[]) =>
		list.length ? (
			<View style={{ gap: 12 }}>
				<KText v="label">
					{label} · {list.length}
				</KText>
				{list.map((i) => (
					<TripCard key={i.id} i={i} />
				))}
			</View>
		) : null;

	return (
		<Screen tabbed refreshing={false} onRefresh={() => (refetchApps({ requestPolicy: 'network-only' }), refetchBks({ requestPolicy: 'network-only' }))}>
			<PageTitle eyebrow="Your homes" title="Applications & homes" />
			{loading ? (
				<View style={{ gap: 12 }}>
					{[0, 1].map((k) => (
						<Skeleton key={k} style={{ height: 120, borderRadius: radius.lg }} />
					))}
				</View>
			) : !items.length ? (
				<Empty eyebrow="Nothing yet" title="Your next home starts here" body="When you apply for a home, you’ll follow every step here — from the host’s answer to getting your keys." action="Explore homes" onAction={() => router.navigate('/')} />
			) : (
				<>
					{group('In progress', active)}
					{group('Your homes', homes)}
					{group('Past', past)}
				</>
			)}
		</Screen>
	);
}

function TripCard({ i }: { i: Item }) {
	const hot = i.stage === 'accepted';
	const p = progress(i.stage);
	return (
		<Pressable onPress={() => router.push(`/trips/${i.id}`)} style={({ pressed }) => [s.card, hot && s.hot, i.stage === 'ended' && { opacity: 0.65 }, pressed && { opacity: 0.85 }]}>
			<View style={{ flexDirection: 'row', gap: 14 }}>
				<Photo assetId={i.assetId} w={300} h={300} style={{ width: 84, height: 84 }} />
				<View style={{ flex: 1, gap: 5 }}>
					<Pill tone={STAGE[i.stage].tone}>{STAGE[i.stage].label}</Pill>
					<KText v="bodyStrong" numberOfLines={1}>
						{i.title}
					</KText>
					<KText v="xs" numberOfLines={1}>
						{i.where}
						{i.start ? ` · from ${date(i.start)}` : ''} · {i.length}
					</KText>
				</View>
				<ChevronRight size={18} color={color.dim} style={{ alignSelf: 'center' }} />
			</View>
			{i.stage !== 'ended' && i.stage !== 'draft' ? (
				<View style={{ flexDirection: 'row', gap: 4 }}>
					{JOURNEY.map((w, wi) => (
						<View key={w.key} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: p >= wi ? color.amber : color.line2 }} />
					))}
				</View>
			) : null}
			<KText v="small">{STAGE[i.stage].next}</KText>
			{i.pay ? (
				<Pressable onPress={() => router.push({ pathname: '/pay', params: i.pay })} style={s.pay}>
					<Wallet size={16} color={color.onAmber} />
					<KText style={{ fontFamily: font.bodySemi, color: color.onAmber }}>Pay {i.amount ? naira(i.amount) : 'now'}</KText>
				</Pressable>
			) : (
				<KText v="xs" style={{ alignSelf: 'flex-end' }}>
					{relative(i.updated)}
				</KText>
			)}
		</Pressable>
	);
}

const s = StyleSheet.create({
	card: { gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	hot: { borderColor: color.amberLine, backgroundColor: 'rgba(245,158,11,0.05)' },
	pay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: radius.pill, backgroundColor: color.amber }
});
