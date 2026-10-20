import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, useFocusEffect } from 'expo-router';
import { useSubscription } from 'urql';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Headset, Search } from 'lucide-react-native';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { relative } from '@/lib/k/format';
import { useUserStore } from '@/lib/stores/users';
import { useUserChatsQuery, type UserChatUpdatedSubscription } from '@/lib/services/graphql/generated';
import { USER_CHAT_UPDATED } from '@/lib/services/graphql/requests/subscriptions/hosting_chat';
import { Avatar, Skeleton } from './surface';
import { KText } from './text';
import { Empty } from './feedback';
import { PageTitle } from './layout';
import { SignedOut } from './signed-out';

/** Conversations list — shared by guest and host modes. */
export function Inbox() {
	const insets = useSafeAreaInsets();
	const layout = useLayout();
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const [{ data, fetching }, refetch] = useUserChatsQuery({ variables: { pagination: { limit: 100, offset: 0 } }, pause: !signedIn, requestPolicy: 'cache-and-network' });
	const [q, setQ] = useState('');

	// The tab stays mounted, so a one-off fetch went stale. Re-read the list
	// whenever the inbox comes into view or the app returns to the foreground
	// (the live feed below can miss events while the socket was asleep).
	const reload = useCallback(() => {
		if (signedIn) refetch({ requestPolicy: 'network-only' });
	}, [signedIn, refetch]);
	useFocusEffect(reload);
	useEffect(() => {
		const sub = AppState.addEventListener('change', (st) => st === 'active' && reload());
		return () => sub.remove();
	}, [reload]);

	// Live list: `userChatUpdated` fires when a message lands in any of the
	// user's chats. It selects the same fields as the list query, so the cache
	// updates that row's last message, time and unread count in place, and the
	// sort below moves it to the top. Only a chat not in the list yet needs a
	// reload.
	const known = useRef(new Set<string>());
	known.current = new Set((data?.userChats ?? []).map((c) => c.id));
	useSubscription<UserChatUpdatedSubscription>({ query: USER_CHAT_UPDATED, pause: !signedIn }, (_prev, curr) => {
		const id = curr?.userChatUpdated?.id;
		if (id && !known.current.has(id)) {
			known.current.add(id);
			reload();
		}
		return curr;
	});

	const chats = useMemo(() => {
		const t = q.trim().toLowerCase();
		return (data?.userChats ?? [])
			.filter((c) => !t || (c.recipientUser?.profile?.fullName ?? '').toLowerCase().includes(t) || (c.hosting?.title ?? '').toLowerCase().includes(t))
			.sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''));
	}, [data, q]);

	if (!signedIn)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg, justifyContent: 'center', paddingHorizontal: gutter }}>
				<View style={centered(layout.max('form'))}>
					<SignedOut eyebrow="Inbox" title="Talk to hosts directly" body="Ask about a home, arrange viewings and the key handover — sign in to start a conversation." />
				</View>
			</View>
		);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				data={fetching && !data ? [] : chats}
				keyExtractor={(c) => c.id}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				contentContainerStyle={[{ paddingHorizontal: gutter, paddingBottom: 40 }, centered(layout.max('reading'))]}
				ListHeaderComponent={
					<View style={{ gap: 16, paddingBottom: 8 }}>
						<PageTitle eyebrow="Inbox" title="Messages" />
						<View style={s.search}>
							<Search size={16} color={color.muted} />
							<TextInput value={q} onChangeText={setQ} placeholder="Search people or homes" placeholderTextColor={color.dim} style={s.input} />
						</View>
						<Pressable onPress={() => router.push('/support')} style={({ pressed }) => [s.support, pressed && { opacity: 0.8 }]}>
							<View style={s.supIc}>
								<Headset size={18} color={color.signal} />
							</View>
							<View style={{ flex: 1 }}>
								<KText v="bodyStrong">Kushi Support</KText>
								<KText v="xs">Questions about a booking or payment? Real people reply.</KText>
							</View>
						</Pressable>
					</View>
				}
				renderItem={({ item: c }) => {
					const unread = (c.unreadMessageCount ?? 0) > 0;
					const preview = c.lastMessage?.text?.trim() || (c.lastMessage?.assets?.length ? 'Attachment' : 'Say hello 👋');
					return (
						<Pressable onPress={() => router.push(`/chats/${c.id}`)} style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}>
							<View>
								<Avatar name={c.recipientUser?.profile?.fullName} uri={c.recipientUser?.profile?.image?.publicUrl} size={48} />
								{c.recipientUser?.onlineUser?.online ? <View style={s.online} /> : null}
							</View>
							<View style={{ flex: 1, gap: 2 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
									<KText v="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
										{c.recipientUser?.profile?.fullName ?? 'Kushi user'}
									</KText>
									<KText v="xs">{c.lastUpdated ? relative(c.lastUpdated) : ''}</KText>
								</View>
								<KText v="xs" c="amber" numberOfLines={1}>
									{c.hosting?.title}
								</KText>
								<KText v="small" numberOfLines={1} style={unread ? { color: color.fg, fontFamily: font.bodyMedium } : undefined}>
									{preview}
								</KText>
							</View>
							{unread ? (
								<View style={s.badge}>
									<KText style={{ fontSize: 11, color: color.onAmber, fontFamily: font.bodyBold }}>{c.unreadMessageCount}</KText>
								</View>
							) : null}
						</Pressable>
					);
				}}
				ListEmptyComponent={
					fetching ? (
						<View style={{ gap: 12, paddingTop: 8 }}>
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} style={{ height: 64 }} />
							))}
						</View>
					) : (
						<Empty eyebrow="Quiet channel" title={q ? 'No conversations match' : 'No conversations yet'} body={q ? undefined : 'Message a host from any home to ask a question or arrange a viewing.'} />
					)
				}
			/>
		</View>
	);
}

const s = StyleSheet.create({
	search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	input: { flex: 1, color: color.fg, fontFamily: font.body, fontSize: 15, outlineStyle: 'none' } as object,
	support: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.line2 },
	supIc: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(76,143,240,0.16)' },
	row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
	online: { position: 'absolute', right: 1, bottom: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: color.success, borderWidth: 2, borderColor: color.bg },
	badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }
});
