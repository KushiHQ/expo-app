import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Bell, CalendarCheck, Home, MessageCircle, PhoneMissed, Sparkles } from 'lucide-react-native';
import { Button, Empty, Header, KText, Screen, Segmented, Skeleton } from '@/components/k';
import { color, gutter } from '@/lib/k/theme';
import { relative } from '@/lib/k/format';
import {
	NotificationIntent,
	NotificationSubject,
	NotificationType,
	useMarkAllNotificationsAsReadMutation,
	useMarkNotificationAsReadMutation,
	useNotificationsQuery,
	type NotificationsQuery
} from '@/lib/services/graphql/generated';

type N = NotificationsQuery['notifications'][number];

/** Where a notification should take you, for renters and hosts. */
function target(n: N): Href | null {
	const d = n.data;
	if (!d?.id) return null;
	const host = n.type === NotificationType.HostAlert;
	switch (d.subject) {
		case NotificationSubject.Chat:
			return `/chats/${d.id}`;
		case NotificationSubject.BookingApplication:
			return host ? `/applications/${d.id}` : `/trips/${d.id}`;
		case NotificationSubject.Booking:
			return host ? '/host' : `/trips/booking/${d.id}`;
		case NotificationSubject.Hosting:
			return host ? { pathname: '/hostings/form/onboarding', params: { id: d.id } } : `/hostings/${d.id}`;
		default:
			return null;
	}
}

export default function Notifications() {
	const [tab, setTab] = useState<'all' | NotificationType>('all');
	const [{ data, fetching }, refetch] = useNotificationsQuery({
		variables: { filter: tab === 'all' ? null : { type: tab }, pagination: { limit: 60, offset: 0 } },
		requestPolicy: 'cache-and-network'
	});
	const [read, setRead] = useState<Record<string, boolean>>({});
	const [, markOne] = useMarkNotificationAsReadMutation();
	const [, markAll] = useMarkAllNotificationsAsReadMutation();
	const items = data?.notifications ?? [];
	const isRead = (n: N) => n.isRead || read[n.id];
	const unread = items.filter((n) => !isRead(n)).length;

	const sections = useMemo(() => {
		const today = new Date().toDateString();
		const week = Date.now() - 7 * 864e5;
		const g: Record<string, N[]> = { Today: [], 'This week': [], Earlier: [] };
		for (const n of items) {
			const d = new Date(n.createdAt);
			(d.toDateString() === today ? g.Today : d.getTime() > week ? g['This week'] : g.Earlier).push(n);
		}
		return Object.entries(g)
			.filter(([, v]) => v.length)
			.map(([title, data]) => ({ title, data }));
	}, [items]);

	function open(n: N) {
		if (!isRead(n)) {
			setRead((r) => ({ ...r, [n.id]: true }));
			markOne({ notificationId: n.id }).catch(() => {});
		}
		const t = target(n);
		if (t) router.push(t);
	}

	const icon = (n: N) =>
		n.data?.intent === NotificationIntent.MissedCall || n.data?.intent === NotificationIntent.IncomingCall
			? PhoneMissed
			: n.data?.subject === NotificationSubject.Chat
				? MessageCircle
				: n.data?.subject === NotificationSubject.Booking || n.data?.subject === NotificationSubject.BookingApplication
					? CalendarCheck
					: n.data?.subject === NotificationSubject.Hosting
						? Home
						: n.type === NotificationType.System
							? Sparkles
							: Bell;

	return (
		<Screen
			scroll={false}
			padded={false}
			header={
				<Header
					title="Notifications"
					right={
						unread ? (
							<Button
								title="Mark all read"
								variant="quiet"
								size="sm"
								onPress={async () => {
									setRead(Object.fromEntries(items.map((n) => [n.id, true])));
									await markAll({});
								}}
							/>
						) : undefined
					}
				/>
			}
		>
			<SectionList
				sections={fetching && !data ? [] : sections}
				keyExtractor={(n) => n.id}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				stickySectionHeadersEnabled={false}
				contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 40 }}
				ListHeaderComponent={
					<View style={{ paddingVertical: 16 }}>
						<Segmented
							value={tab}
							onChange={setTab}
							options={[
								{ value: 'all', label: 'All' },
								{ value: NotificationType.GuestAlert, label: 'Renting' },
								{ value: NotificationType.HostAlert, label: 'Hosting' }
							]}
						/>
					</View>
				}
				renderSectionHeader={({ section }) => (
					<KText v="label" style={{ paddingTop: 12, paddingBottom: 6 }}>
						{section.title}
					</KText>
				)}
				renderItem={({ item: n }) => {
					const I = icon(n);
					const unreadItem = !isRead(n);
					return (
						<Pressable onPress={() => open(n)} style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}>
							<View style={[s.ic, unreadItem && { borderColor: color.amberLine }]}>
								<I size={18} color={unreadItem ? color.amber : color.muted} />
							</View>
							<View style={{ flex: 1, gap: 2 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
									<KText v="smallStrong" style={{ flex: 1 }} numberOfLines={1}>
										{n.title}
									</KText>
									{unreadItem ? <View style={s.dot} /> : null}
								</View>
								<KText v="small" numberOfLines={3}>
									{n.message}
								</KText>
								<KText v="xs">{relative(n.createdAt)}</KText>
							</View>
						</Pressable>
					);
				}}
				ListEmptyComponent={
					fetching ? (
						<View style={{ gap: 10 }}>
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} style={{ height: 70 }} />
							))}
						</View>
					) : (
						<Empty eyebrow="All quiet" title="You’re all caught up" body="Updates about applications, payments and messages will appear here." />
					)
				}
			/>
		</Screen>
	);
}

const s = StyleSheet.create({
	row: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
	ic: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber }
});

