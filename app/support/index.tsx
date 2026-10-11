import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, useFocusEffect } from 'expo-router';
import { Headset, MessageCirclePlus } from 'lucide-react-native';
import { Button, Header, KText, Skeleton } from '@/components/k';
import { color, gutter, radius } from '@/lib/k/theme';
import { humanize, relative } from '@/lib/k/format';
import { toast } from '@/lib/hooks/use-toast';
import { useInitiateSupportChatMutation, useMySupportChatsQuery } from '@/lib/services/graphql/generated';

const TOPIC: Record<string, string> = { BOOKING: 'About a booking', HOSTING: 'About a listing', TRANSACTION: 'About a payment' };

export default function SupportInbox() {
	const [{ data, fetching }, refetch] = useMySupportChatsQuery({ variables: { pagination: { limit: 50, offset: 0 } }, requestPolicy: 'cache-and-network' });
	const [{ fetching: starting }, start] = useInitiateSupportChatMutation();
	useFocusEffect(useCallback(() => refetch({ requestPolicy: 'network-only' }), [refetch]));
	const chats = data?.mySupportChats ?? [];

	async function begin() {
		const r = await start({});
		const id = r.data?.initiateSupportChat?.id;
		if (id) router.push(`/support/${id}`);
		else toast.show({ type: 'error', text1: 'Couldn’t reach support', text2: (r.error?.message ?? '').replace('[GraphQL] ', '') });
	}

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<Header eyebrow="Help" title="Kushi Support" />
			<FlatList
				data={chats}
				keyExtractor={(c) => c.id}
				onRefresh={() => refetch({ requestPolicy: 'network-only' })}
				refreshing={false}
				contentContainerStyle={{ padding: gutter, gap: 10, paddingBottom: 48 }}
				ListHeaderComponent={
					<View style={{ gap: 16, paddingBottom: 14 }}>
						<View style={s.hero}>
							<Headset size={22} color={color.amber} />
							<KText v="heading">Talk to a real person</KText>
							<KText v="small">
								Questions about a home, a payment or your keys? Our team answers right here. For anything about a specific booking, open it from Homes and tap Get help so we see the details.
							</KText>
							<Button title="Start a conversation" icon={<MessageCirclePlus size={16} color={color.onAmber} />} loading={starting} onPress={begin} />
						</View>
						{chats.length ? <KText v="label">Your conversations</KText> : null}
					</View>
				}
				renderItem={({ item: c }) => {
					const last = c.messages?.[0];
					const unread = !!last && !last.isReadByUser;
					return (
						<Pressable onPress={() => router.push(`/support/${c.id}`)} style={({ pressed }) => [s.row, unread && { borderColor: color.amberLine }, pressed && { opacity: 0.8 }]}>
							<View style={{ flex: 1, gap: 4 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
									<KText v="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
										{c.itemType ? (TOPIC[c.itemType] ?? humanize(c.itemType)) : 'General question'}
									</KText>
									<KText v="xs">{relative(c.lastUpdated)}</KText>
								</View>
								<KText v="small" numberOfLines={1} style={unread ? { color: color.fg } : undefined}>
									{last?.text ?? (c.status === 'OPEN' ? 'New conversation' : 'Closed')}
								</KText>
							</View>
							{unread ? <View style={s.dot} /> : null}
						</Pressable>
					);
				}}
				ListEmptyComponent={
					fetching && !data ? (
						<View style={{ gap: 10 }}>
							{[0, 1].map((i) => (
								<Skeleton key={i} style={{ height: 72 }} />
							))}
						</View>
					) : null
				}
			/>
		</View>
	);
}

const s = StyleSheet.create({
	hero: { gap: 10, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber }
});
