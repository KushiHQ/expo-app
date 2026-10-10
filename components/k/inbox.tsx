import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Headset, Search } from 'lucide-react-native';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { relative } from '@/lib/k/format';
import { useUserStore } from '@/lib/stores/users';
import { useUserChatsQuery } from '@/lib/services/graphql/generated';
import { Avatar, Skeleton } from './surface';
import { KText } from './text';
import { Empty } from './feedback';
import { PageTitle } from './layout';
import { SignedOut } from './signed-out';

/** Conversations list — shared by guest and host modes. */
export function Inbox() {
	const insets = useSafeAreaInsets();
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const [{ data, fetching }, refetch] = useUserChatsQuery({ variables: { pagination: { limit: 100, offset: 0 } }, pause: !signedIn, requestPolicy: 'cache-and-network' });
	const [q, setQ] = useState('');
	const chats = useMemo(() => {
		const t = q.trim().toLowerCase();
		return (data?.userChats ?? [])
			.filter((c) => !t || (c.recipientUser?.profile?.fullName ?? '').toLowerCase().includes(t) || (c.hosting?.title ?? '').toLowerCase().includes(t))
			.sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''));
	}, [data, q]);

	if (!signedIn)
		return (
			<View style={{ flex: 1, backgroundColor: color.bg, justifyContent: 'center', paddingHorizontal: gutter }}>
				<SignedOut eyebrow="Inbox" title="Talk to hosts directly" body="Ask about a home, arrange viewings and the key handover — sign in to start a conversation." />
			</View>
		);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
			<FlatList
				data={fetching && !data ? [] : chats}
				keyExtractor={(c) => c.id}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 40 }}
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
