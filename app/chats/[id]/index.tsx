import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, ScrollView, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useQuery } from 'urql';
import { useAudioPlayer } from 'expo-audio';
import * as Sentry from '@sentry/react-native';
import { ChatHeader, Composer, DayDivider, MessageBubble, type Attachment, type ChatMsg } from '@/components/k/chat';
import { LinkSheetHost, MessageActionsSheet, canEditMessage, type ReplyRef } from '@/components/k/chat-actions';
import { toast } from '@/lib/hooks/use-toast';
import { Avatar, Chip, KText, Notice, Photo, Skeleton, Spinner } from '@/components/k';
import { useNotifications } from '@/components/contexts/notifications';
import { color, gutter, radius } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';
import { useLayout } from '@/lib/k/layout';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { buildCallURL } from '@/lib/utils/call';
import { generateRNFile } from '@/lib/utils/file';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import { CREATE_UPDATE_MESSAGE } from '@/lib/services/graphql/requests/mutations/hosting-chat';
import { K_CHAT } from '@/lib/services/graphql/requests/queries/k-manage';
import { dismissChatNotifications } from '@/lib/k/app-badge';
import { onLiveReconnected, useLiveOutage } from '@/lib/k/live-connection';
import { primeMicPermission } from '@/lib/call/permissions';
import {
	useChatMessagesQuery,
	useClearChatUrnreadMessagesMutation,
	useLatestHostingChatMessageSubscription,
	useOnlineUserSubscription,
	type CreateUpdateMessageMutation,
	type CreateUpdateMessageMutationVariables,
	type LatestHostingChatMessageSubscription,
	type OnlineUserSubscription
} from '@/lib/services/graphql/generated';

type KChat = {
	hostingChat: {
		id: string;
		hosting?: { id: string; title?: string | null; city?: string | null; state?: string | null; price?: number | null; paymentInterval?: string | null; coverImage?: { asset?: { id: string } | null } | null } | null;
		recipientUser?: { id: string; profile?: { fullName?: string | null; image?: { publicUrl?: string | null } | null } | null; onlineUser?: { online: boolean; lastSeen?: string | null } | null } | null;
	};
};

type Row = { kind: 'msg'; m: ChatMsg; last: boolean } | { kind: 'day'; key: string; iso: string };

const GROUP_MS = 5 * 60 * 1000;
const STARTERS = ['Is it still available?', 'Can I arrange a viewing?', 'When can I move in?'];

export default function Conversation() {
	const { id: rawId } = useLocalSearchParams<{ id: string }>();
	const id = String(rawId);
	const layout = useLayout();
	const column = layout.max('reading');
	const { setActiveChatId } = useNotifications();
	const sendSound = useAudioPlayer(require('@/assets/audio/message-send-sound.mp3'));
	const list = useRef<FlatList<Row>>(null);
	const nearBottom = useRef(true);
	// Rows as last rendered, for jumping to a quoted message. Declared before the rows memo, which writes it.
	const rowsRef = useRef<Row[]>([]);

	const [{ data: chatData, error: chatError }] = useQuery<KChat>({ query: K_CHAT, variables: { chatId: id }, requestPolicy: 'cache-and-network' });
	const chat = chatData?.hostingChat;
	const other = chat?.recipientUser;
	const { items: paged, fetching, error, loadMore, hasNextPage, refresh } = useInfiniteQuery(useChatMessagesQuery, {
		queryKey: 'chatMessages',
		initialVariables: { chatId: id },
		limit: 30,
		requestPolicy: 'network-only'
	});
	// Messages that arrived live (subscription or our own sends) and local unsent ones.
	const [live, setLive] = useState<ChatMsg[]>([]);
	const [pending, setPending] = useState<ChatMsg[]>([]);
	const [presence, setPresence] = useState<OnlineUserSubscription['onlineUser'] | null>(null);
	const [draft, setDraft] = useState<string | undefined>();
	const [actionsFor, setActionsFor] = useState<ChatMsg | null>(null);
	const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
	const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
	const [highlighted, setHighlighted] = useState<string | null>(null);
	const [, clearUnread] = useClearChatUrnreadMessagesMutation();

	useEffect(() => {
		setActiveChatId(id);
		clearUnread({ chatId: id });
		dismissChatNotifications(id).catch(() => {});
		return () => setActiveChatId(null);
	}, [id, setActiveChatId, clearUnread]);

	const addLive = useCallback((msg: ChatMsg) => {
		setLive((prev) => [msg, ...prev.filter((m) => m.id !== msg.id)]);
		if (nearBottom.current) list.current?.scrollToOffset({ offset: 0, animated: true });
	}, []);

	const [{ error: subError }] = useLatestHostingChatMessageSubscription({ variables: { chatId: id } }, (_prev: unknown, curr: LatestHostingChatMessageSubscription) => {
		addLive(curr.latestHostingChatMessage as ChatMsg);
		return curr;
	});
	useEffect(() => {
		if (subError) Sentry.captureException(subError, { tags: { area: 'chat-subscription', chatId: id } });
	}, [subError, id]);

	// Live updates drop and come back on their own (background, power saving,
	// network changes). When they do, fetch the latest page so nothing sent in
	// the gap is missed. Users only hear about it after a long outage.
	const refreshRef = useRef(refresh);
	refreshRef.current = refresh;
	useEffect(() => onLiveReconnected(() => refreshRef.current()), []);
	const outage = useLiveOutage();

	// Ask for the microphone here, before any call: an incoming call is often
	// answered from the lock screen, where no permission prompt can show.
	useEffect(() => {
		primeMicPermission();
	}, []);

	useOnlineUserSubscription({ variables: { userId: other?.id ?? '' }, pause: !other?.id }, (_prev: unknown, curr: OnlineUserSubscription) => {
		setPresence(curr.onlineUser);
		return curr;
	});

	const messages = useMemo(() => {
		const seen = new Set<string>();
		const server = [...live, ...(paged as ChatMsg[])].filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
		server.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		return [...pending, ...server];
	}, [live, paged, pending]);

	// Inverted list: newest first. A day divider follows the oldest message of each day.
	const rows = useMemo<Row[]>(() => {
		const out: Row[] = [];
		messages.forEach((m, i) => {
			const newer = messages[i - 1];
			const older = messages[i + 1];
			const t = new Date(m.createdAt).getTime();
			const last = !newer || newer.isSender !== m.isSender || new Date(newer.createdAt).getTime() - t > GROUP_MS || !!newer.messageType?.includes('call');
			out.push({ kind: 'msg', m, last });
			if (!older || new Date(older.createdAt).toDateString() !== new Date(m.createdAt).toDateString()) out.push({ kind: 'day', key: `day-${m.id}`, iso: m.createdAt });
		});
		rowsRef.current = out;
		return out;
	}, [messages]);

	const deliver = useCallback(
		async (msg: ChatMsg) => {
			setPending((p) => p.map((x) => (x.id === msg.id ? { ...x, state: 'sending' } : x)));
			const files = msg.local ?? [];
			let sent: CreateUpdateMessageMutation['createUpdateMessage'] | undefined;
			try {
				const res = await formMutation<CreateUpdateMessageMutation, CreateUpdateMessageMutationVariables>(CREATE_UPDATE_MESSAGE, {
					input: { chatId: id, text: msg.text, ...(msg.replyTo ? { replyToId: msg.replyTo.id } : {}), assets: files.map((f) => ({ ...generateRNFile(f.uri), ...(f.name ? { name: f.name } : {}), ...(f.mimeType ? { type: f.mimeType } : {}) })) }
				});
				if (!res.error) sent = res.data?.createUpdateMessage;
			} catch {}
			if (!sent) {
				setPending((p) => p.map((x) => (x.id === msg.id ? { ...x, state: 'failed' } : x)));
				return;
			}
			setPending((p) => p.filter((x) => x.id !== msg.id));
			addLive(sent as ChatMsg);
		},
		[id, addLive]
	);

	const send = useCallback(
		(text: string, files: Attachment[]) => {
			const now = new Date().toISOString();
			const msg: ChatMsg = { id: `local-${Date.now()}`, text, isSender: true, createdAt: now, lastUpdated: now, assets: [], local: files, state: 'sending', replyTo };
			setPending((p) => [msg, ...p]);
			setDraft(undefined);
			setReplyTo(null);
			list.current?.scrollToOffset({ offset: 0, animated: true });
			try {
				sendSound.seekTo(0);
				sendSound.play();
			} catch {}
			deliver(msg);
		},
		[deliver, sendSound, replyTo]
	);

	// Edits show straight away and roll back if the server says no.
	const saveEdit = useCallback(
		async (msgId: string, text: string) => {
			const original = messages.find((m) => m.id === msgId);
			setEditing(null);
			if (!original || original.text === text) return;
			const upsert = (m: ChatMsg) => setLive((prev) => [m, ...prev.filter((x) => x.id !== m.id)]);
			upsert({ ...original, text, edited: true });
			let saved: CreateUpdateMessageMutation['createUpdateMessage'] | undefined;
			let reason: string | undefined;
			try {
				const res = await formMutation<CreateUpdateMessageMutation, CreateUpdateMessageMutationVariables>(CREATE_UPDATE_MESSAGE, { input: { id: msgId, chatId: id, text } });
				if (res.error) reason = res.error.graphQLErrors?.[0]?.message;
				else saved = res.data?.createUpdateMessage;
			} catch {}
			if (saved) return upsert(saved as ChatMsg);
			upsert(original);
			toast.show({ type: 'error', text1: 'Couldn’t edit message', text2: reason ?? 'Check your connection and try again.' });
		},
		[id, messages]
	);

	const startReply = useCallback((m: ChatMsg) => {
		setEditing(null);
		setReplyTo({ id: m.id, text: m.text, messageType: m.messageType, isSender: m.isSender, sender: m.sender, assets: m.assets });
	}, []);
	const startEdit = useCallback((m: ChatMsg) => {
		if (!canEditMessage(m)) return;
		setReplyTo(null);
		setEditing({ id: m.id, text: m.text });
	}, []);

	// Tap a quote: scroll to the original and tint it for a moment.
	const jumpTo = useCallback((msgId: string) => {
		const index = rowsRef.current.findIndex((r) => r.kind === 'msg' && r.m.id === msgId);
		if (index < 0) {
			toast.show({ type: 'info', text1: 'That message is further up', text2: 'Scroll up to load older messages.' });
			return;
		}
		list.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
		setHighlighted(msgId);
		setTimeout(() => setHighlighted((h) => (h === msgId ? null : h)), 1600);
	}, []);

	const retry = useCallback((m: ChatMsg) => deliver(m), [deliver]);
	const discard = useCallback((m: ChatMsg) => setPending((p) => p.filter((x) => x.id !== m.id)), []);

	const renderItem = useCallback(
		({ item }: { item: Row }) =>
			item.kind === 'day' ? (
				<DayDivider iso={item.iso} />
			) : (
				<MessageBubble
					m={item.m}
					last={item.last}
					highlighted={highlighted === item.m.id}
					onRetry={retry}
					onDiscard={discard}
					onActions={setActionsFor}
					onReply={item.m.messageType ? undefined : startReply}
					onJumpTo={jumpTo}
				/>
			),
		[retry, discard, startReply, jumpTo, highlighted]
	);

	const online = presence ? presence.online : !!other?.onlineUser?.online;
	const lastSeen = presence?.lastSeen ?? other?.onlineUser?.lastSeen;
	const name = other?.profile?.fullName ?? (chatData ? 'Kushi user' : undefined);
	const firstLoad = fetching && !messages.length;
	const loadFailed = !!error && !messages.length;

	const intro = (
		<View style={{ alignItems: 'center', gap: 10, paddingTop: 24, paddingBottom: 12 }}>
			<Pressable onPress={() => other?.id && router.push(`/users/${other.id}`)} accessibilityRole="button" accessibilityLabel={`View ${name ?? 'their'} profile`} style={{ alignItems: 'center', gap: 8 }}>
				<Avatar size={64} name={name} uri={other?.profile?.image?.publicUrl} />
				<KText v="heading">{name}</KText>
			</Pressable>
			{chat?.hosting ? (
				<Pressable onPress={() => router.push(`/hostings/${chat.hosting!.id}`)} style={({ pressed }) => [{ flexDirection: 'row', gap: 12, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, alignSelf: 'stretch' }, pressed && { opacity: 0.8 }]}>
					<Photo assetId={chat.hosting.coverImage?.asset?.id} w={200} h={200} style={{ width: 56, height: 56 }} />
					<View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
						<KText v="micro" c="amber">
							About this home
						</KText>
						<KText v="bodyStrong" numberOfLines={1}>
							{chat.hosting.title}
						</KText>
						<KText v="xs" numberOfLines={1}>
							{place(chat.hosting.city, chat.hosting.state)}
							{chat.hosting.price ? ` · ${naira(chat.hosting.price)} ${perInterval(chat.hosting.paymentInterval)}` : ''}
						</KText>
					</View>
				</Pressable>
			) : null}
			<KText v="xs" center style={{ maxWidth: 300 }}>
				Keep messages and payments on Kushi so we can help if anything goes wrong.
			</KText>
			{fetching && hasNextPage && messages.length ? <Spinner /> : null}
		</View>
	);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg }}>
			<ChatHeader
				name={name}
				avatar={other?.profile?.image?.publicUrl}
				online={online}
				lastSeen={lastSeen}
				listing={chat?.hosting}
				maxWidth={column}
				onProfile={other?.id ? () => router.push(`/users/${other.id}`) : undefined}
				onVoice={() => router.push(buildCallURL(id, 'voice', true))}
				onVideo={() => router.push(buildCallURL(id, 'video', true))}
			/>
			<KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
				{outage ? (
					<View style={{ paddingHorizontal: gutter, paddingTop: 8 }}>
						<Notice tone="info">Reconnecting… New messages will show up as soon as you’re back online.</Notice>
					</View>
				) : null}
				{firstLoad ? (
					<View style={[{ flex: 1, justifyContent: 'flex-end', gap: 10, padding: gutter }, column ? { width: '100%', maxWidth: column, alignSelf: 'center' } : null]}>
						<Skeleton style={{ height: 40, width: '55%' }} />
						<Skeleton style={{ height: 40, width: '40%', alignSelf: 'flex-end' }} />
						<Skeleton style={{ height: 60, width: '65%' }} />
					</View>
				) : loadFailed ? (
					<View style={{ flex: 1, justifyContent: 'center', padding: gutter }}>
						<Notice tone="danger" title="Couldn’t load this conversation" action="Try again" onAction={refresh}>
							{chatError ? 'We couldn’t reach Kushi. Check your connection.' : 'Check your connection and try again.'}
						</Notice>
					</View>
				) : !messages.length ? (
					<ScrollView contentContainerStyle={[{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: gutter, paddingBottom: 16 }, column ? { width: '100%', maxWidth: column, alignSelf: 'center' } : null]} keyboardShouldPersistTaps="handled">
						{intro}
						<View style={{ gap: 10, alignItems: 'center', paddingTop: 8 }} testID="chat-empty">
							<KText v="small">No messages yet. Say hello or ask about the home.</KText>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
								{STARTERS.map((q) => (
									<Chip key={q} label={q} onPress={() => setDraft(q)} />
								))}
							</View>
						</View>
					</ScrollView>
				) : (
					<FlatList
						ref={list}
						testID="chat-messages"
						data={rows}
						inverted
						keyExtractor={(r) => (r.kind === 'day' ? r.key : r.m.id)}
						renderItem={renderItem}
						onScroll={(e) => (nearBottom.current = e.nativeEvent.contentOffset.y < 120)}
						scrollEventThrottle={100}
						onEndReached={() => hasNextPage && !fetching && loadMore()}
						onEndReachedThreshold={0.4}
						windowSize={11}
						maxToRenderPerBatch={12}
						removeClippedSubviews={Platform.OS === 'android'}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="interactive"
						contentContainerStyle={[{ paddingHorizontal: gutter, paddingVertical: 12, flexGrow: 1 }, column ? { width: '100%', maxWidth: column, alignSelf: 'center' } : null]}
						extraData={highlighted}
						onScrollToIndexFailed={(info) => {
							list.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
							setTimeout(() => list.current?.scrollToIndex({ index: info.index, viewPosition: 0.5, animated: true }), 250);
						}}
						ListFooterComponent={hasNextPage && messages.length ? <View style={{ paddingVertical: 16 }}>{fetching ? <Spinner /> : null}</View> : intro}
						showsVerticalScrollIndicator={false}
					/>
				)}
				<Composer
					onSend={send}
					initial={draft}
					maxWidth={column}
					replyTo={replyTo}
					onCancelReply={() => setReplyTo(null)}
					editing={editing}
					onSaveEdit={saveEdit}
					onCancelEdit={() => setEditing(null)}
				/>
			</KeyboardAvoidingView>
			<MessageActionsSheet message={actionsFor} onClose={() => setActionsFor(null)} onReply={startReply} onEdit={startEdit} />
			<LinkSheetHost />
		</View>
	);
}
