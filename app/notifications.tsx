import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, type Href } from 'expo-router';
import { Bell, CalendarCheck, Home, MessageCircle, PhoneMissed, Settings2, Sparkles } from 'lucide-react-native';
import { Button, Empty, Header, IconButton, KText, Notice, Screen, Segmented, Skeleton, Spinner } from '@/components/k';
import { color } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { relative } from '@/lib/k/format';
import { cleanError } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { useUserStore } from '@/lib/stores/users';
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

/** The one notifications screen (renters and hosts). */
export default function Notifications() {
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const layout = useLayout();
	const column = centered(layout.max('reading'));
	const [tab, setTab] = useState<'all' | NotificationType>('all');
	const { items, fetching, error, loadMore, hasNextPage, refresh, showInitialSkeleton } = useInfiniteQuery(useNotificationsQuery, {
		queryKey: 'notifications',
		initialVariables: { filter: tab === 'all' ? null : { type: tab } },
		limit: 30,
		requestPolicy: 'cache-and-network'
	});
	const [read, setRead] = useState<Record<string, boolean>>({});
	const [, markOne] = useMarkNotificationAsReadMutation();
	const [{ fetching: markingAll }, markAll] = useMarkAllNotificationsAsReadMutation();
	const list = useMemo(() => (items ?? []).filter(Boolean) as N[], [items]);
	const isRead = (n: N) => n.isRead || read[n.id];
	const unread = list.filter((n) => !isRead(n)).length;

	const sections = useMemo(() => {
		const today = new Date().toDateString();
		const week = Date.now() - 7 * 864e5;
		const g: Record<string, N[]> = { Today: [], 'This week': [], Earlier: [] };
		for (const n of list) {
			const d = new Date(n.createdAt);
			(d.toDateString() === today ? g.Today : d.getTime() > week ? g['This week'] : g.Earlier).push(n);
		}
		return Object.entries(g)
			.filter(([, v]) => v.length)
			.map(([title, data]) => ({ title, data }));
	}, [list]);

	function open(n: N) {
		if (!isRead(n)) {
			setRead((r) => ({ ...r, [n.id]: true }));
			markOne({ notificationId: n.id }).catch(() => {});
		}
		const t = target(n);
		if (t) router.push(t);
	}

	async function readAll() {
		const before = read;
		setRead(Object.fromEntries(list.map((n) => [n.id, true])));
		const r = await markAll({});
		if (r.error) {
			setRead(before);
			toast.show({ type: 'error', text1: 'Couldn’t mark them read', text2: cleanError(r.error.message) });
		}
	}

	if (!signedIn)
		return (
			<Screen header={<Header title="Notifications" />}>
				<Empty eyebrow="Signed out" title="Sign in to see updates" body="Applications, payments and messages show up here once you’re signed in." action="Sign in" onAction={() => router.push('/auth/sign-in')} />
			</Screen>
		);

	return (
		<Screen
			scroll={false}
			padded={false}
			header={
				<Header
					title="Notifications"
					right={
						<>
							{unread ? <Button title="Mark all read" variant="quiet" size="sm" loading={markingAll} onPress={readAll} /> : null}
							<IconButton label="Notification settings" onPress={() => router.push('/account/notifications')}>
								<Settings2 size={17} color={color.fg} />
							</IconButton>
						</>
					}
				/>
			}
		>
			<SectionList
				sections={showInitialSkeleton ? [] : sections}
				keyExtractor={(n) => n.id}
				onRefresh={refresh}
				refreshing={false}
				onEndReached={() => hasNextPage && !fetching && loadMore()}
				onEndReachedThreshold={0.4}
				stickySectionHeadersEnabled={false}
				contentContainerStyle={[{ paddingHorizontal: layout.gutter, paddingBottom: 40 }, column]}
				ListHeaderComponent={
					<View style={{ paddingVertical: 16, gap: 12 }}>
						<Segmented
							value={tab}
							onChange={setTab}
							options={[
								{ value: 'all', label: 'All' },
								{ value: NotificationType.GuestAlert, label: 'Renting' },
								{ value: NotificationType.HostAlert, label: 'Hosting' }
							]}
						/>
						{error && list.length === 0 ? (
							<Notice tone="danger" title="Couldn’t load notifications" action="Try again" onAction={refresh}>
								{cleanError(error.message) || 'Check your connection and pull down to refresh.'}
							</Notice>
						) : null}
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
					const go = !!target(n);
					return (
						<Pressable
							accessibilityRole={go ? 'button' : undefined}
							accessibilityLabel={`${unreadItem ? 'Unread. ' : ''}${n.title}. ${n.message}. ${relative(n.createdAt)}`}
							onPress={() => open(n)}
							style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
						>
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
					showInitialSkeleton ? (
						<View style={{ gap: 10 }}>
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} style={{ height: 70 }} />
							))}
						</View>
					) : error ? null : (
						<Empty eyebrow="All quiet" title="You’re all caught up" body="Updates about applications, payments and messages will appear here." />
					)
				}
				ListFooterComponent={fetching && list.length ? <View style={{ paddingVertical: 16 }}><Spinner /></View> : null}
			/>
		</Screen>
	);
}

const s = StyleSheet.create({
	row: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
	ic: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber }
});
