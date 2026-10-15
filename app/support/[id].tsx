import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Headset } from 'lucide-react-native';
import { Button, Card, Header, KText, Notice, Photo, Pill, Screen, Spinner } from '@/components/k';
import { Composer, MessageBubble, RatingSheet, type Bubble } from '@/components/k/support';
import { color } from '@/lib/k/theme';
import { centered, useLayout } from '@/lib/k/layout';
import { humanize, naira, place } from '@/lib/k/format';
import { cleanError, shortDate } from '@/lib/k/account';
import { useUserStore } from '@/lib/stores/users';
import {
	SupportChatStatus,
	useInitiateSupportChatMutation,
	useSendSupportMessageMutation,
	useSupportChatMessageAddedSubscription,
	useSupportChatMessagesQuery,
	useSupportChatQuery,
	type SupportChatMessagesQuery
} from '@/lib/services/graphql/generated';

const LIMIT = 30;
const GROUP_MS = 5 * 60 * 1000;
type Raw = SupportChatMessagesQuery['supportChat']['messages'][number];
type Local = { id: string; text: string; createdAt: string; state: 'sending' | 'failed' };

/** A conversation with Kushi Support. */
export default function SupportChat() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const chatId = String(id);
	const me = useUserStore((s) => s.user.user?.id);
	const layout = useLayout();
	const column = centered(layout.max('reading'));
	const list = useRef<FlatList<Bubble>>(null);

	const [{ data: chatData, error: chatError }, refetchChat] = useSupportChatQuery({ variables: { id: chatId }, requestPolicy: 'cache-and-network' });
	const [offset, setOffset] = useState(0);
	const [{ data: page, fetching }] = useSupportChatMessagesQuery({ variables: { id: chatId, pagination: { limit: LIMIT, offset } }, requestPolicy: 'network-only' });
	const [server, setServer] = useState<Record<string, Raw>>({});
	const [more, setMore] = useState(true);
	const [local, setLocal] = useState<Local[]>([]);
	const [rateOpen, setRateOpen] = useState(false);
	const [rated, setRated] = useState(false);
	const [, send] = useSendSupportMessageMutation();
	const [{ fetching: starting }, start] = useInitiateSupportChatMutation();

	useEffect(() => {
		const rows = page?.supportChat?.messages;
		if (!rows) return;
		if (rows.length < LIMIT) setMore(false);
		setServer((prev) => ({ ...prev, ...Object.fromEntries(rows.map((m) => [m.id, m])) }));
	}, [page]);

	useSupportChatMessageAddedSubscription({ variables: { chatId } }, (_prev, curr) => {
		const m = curr.supportChatMessageAdded as unknown as Raw;
		setServer((prev) => ({ ...prev, [m.id]: m }));
		setLocal((l) => l.filter((x) => !(x.state === 'sending' && x.text === m.text && m.sender?.id === me)));
		return curr;
	});

	const chat = chatData?.supportChat;
	const closed = chat?.status === SupportChatStatus.Closed || chat?.status === SupportChatStatus.Resolved;
	useEffect(() => {
		if (closed && !chat?.supportChatRating && !rated) setRateOpen(true);
	}, [closed, chat?.supportChatRating, rated]);

	const bubbles = useMemo<Bubble[]>(() => {
		const all: Bubble[] = [
			...Object.values(server).map((m) => ({
				id: m.id,
				text: m.text,
				createdAt: m.createdAt,
				mine: m.sender?.id === me,
				staff: !!m.sender?.isStaff,
				name: m.sender?.profile?.fullName,
				assets: m.assets
			})),
			...local.map((m) => ({ id: m.id, text: m.text, createdAt: m.createdAt, mine: true, staff: false, state: m.state }))
		];
		return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [server, local, me]);

	async function deliver(text: string, tempId = `tmp-${Date.now()}`) {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
		setLocal((l) => [{ id: tempId, text, createdAt: new Date().toISOString(), state: 'sending' as const }, ...l.filter((x) => x.id !== tempId)]);
		list.current?.scrollToOffset({ offset: 0, animated: true });
		const r = await send({ chatId, text });
		const m = r.data?.sendSupportMessage;
		if (r.error || !m) return setLocal((l) => l.map((x) => (x.id === tempId ? { ...x, state: 'failed' as const } : x)));
		setServer((prev) => ({ ...prev, [m.id]: { ...(m as unknown as Raw), assets: [] } }));
		setLocal((l) => l.filter((x) => x.id !== tempId));
	}

	async function newConversation() {
		const r = await start({});
		const nid = r.data?.initiateSupportChat?.id;
		if (nid) router.replace(`/support/${nid}`);
	}

	const context = chat ? <Context chat={chat} /> : null;

	return (
		<Screen
			scroll={false}
			padded={false}
			keyboard
			header={<Header eyebrow={closed ? 'Closed' : 'Kushi Support'} title={chat?.itemType ? `About a ${humanize(chat.itemType).toLowerCase()}` : 'Support'} />}
		>
			<FlatList
				ref={list}
				data={bubbles}
				inverted
				keyExtractor={(m) => m.id}
				contentContainerStyle={[{ paddingHorizontal: layout.gutter, paddingVertical: 16, flexGrow: 1 }, column]}
				renderItem={({ item, index }) => {
					const older = bubbles[index + 1];
					const first = !older || older.mine !== item.mine || new Date(item.createdAt).getTime() - new Date(older.createdAt).getTime() > GROUP_MS;
					return <MessageBubble m={item} first={first} onRetry={item.state === 'failed' ? () => deliver(item.text ?? '', item.id) : undefined} />;
				}}
				onEndReached={() => more && !fetching && setOffset((o) => o + LIMIT)}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					<View style={{ gap: 14, paddingBottom: 8 }}>
						<View style={{ alignItems: 'center', gap: 8, paddingTop: 8 }}>
							<View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: color.amberSoft, alignItems: 'center', justifyContent: 'center' }}>
								<Headset size={24} color={color.amber} />
							</View>
							<KText v="heading">Kushi Support</KText>
							<KText v="xs" center style={{ maxWidth: 300 }}>
								Real people from the Kushi team. We’ll send you a notification when we reply.
							</KText>
						</View>
						{context}
						{fetching && more ? <Spinner /> : null}
						{chatError && !chat ? <Notice tone="danger" title="Couldn’t load this conversation" action="Try again" onAction={() => refetchChat({ requestPolicy: 'network-only' })}>{cleanError(chatError.message)}</Notice> : null}
					</View>
				}
				ListEmptyComponent={
					!fetching ? (
						<View style={{ transform: [{ scaleY: -1 }], paddingVertical: 24 }}>
							<KText v="small" center>
								Say hello and tell us what you need help with. Include any booking or payment reference you have.
							</KText>
						</View>
					) : null
				}
			/>
			{closed ? (
				<View style={{ padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: color.line }}>
					<KText v="small" center>
						This conversation is closed. Need more help? Start a new one.
					</KText>
					<Button title="Start a new conversation" block loading={starting} onPress={newConversation} />
				</View>
			) : (
				<Composer onSend={(t) => deliver(t)} />
			)}
			<RatingSheet
				open={rateOpen && !rated}
				chatId={chatId}
				onClose={() => setRateOpen(false)}
				onRated={() => {
					setRated(true);
					setRateOpen(false);
				}}
			/>
		</Screen>
	);
}

type ChatData = NonNullable<ReturnType<typeof useSupportChatQuery>[0]['data']>['supportChat'];

/** What this conversation is about (home, booking or payment). */
function Context({ chat }: { chat: ChatData }) {
	const h = chat.booking?.hosting ?? chat.hosting;
	if (!h && !chat.transaction) return null;
	return (
		<Card>
			<KText v="label">This conversation is about</KText>
			{h ? (
				<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
					<Photo uri={h.coverImage?.asset?.publicUrl} style={{ width: 52, height: 52 }} />
					<View style={{ flex: 1, gap: 2 }}>
						<KText v="smallStrong" numberOfLines={1}>
							{h.title ?? 'A home'}
						</KText>
						<KText v="xs">{[place(h.city, h.state), chat.booking?.bookingReference ? `Booking ${chat.booking.bookingReference}` : null].filter(Boolean).join(' · ')}</KText>
					</View>
				</View>
			) : null}
			{chat.transaction ? (
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<View style={{ gap: 2 }}>
						<KText v="smallStrong">Payment of {naira(Number(chat.transaction.amount))}</KText>
						<KText v="xs">{shortDate(chat.transaction.createdAt)}</KText>
					</View>
					<Pill tone={chat.transaction.status === 'SUCCESS' ? 'success' : chat.transaction.status === 'FAILED' ? 'danger' : 'info'}>{humanize(chat.transaction.status)}</Pill>
				</View>
			) : null}
		</Card>
	);
}
