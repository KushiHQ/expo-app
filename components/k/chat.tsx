/**
 * Conversation building blocks: header with listing context and call buttons,
 * message bubbles (text, photos, documents, voice notes, call events) with
 * sending / failed states, day dividers, and the composer with attachments.
 */
import { memo, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from '@/components/k/pressable';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { AlertCircle, ArrowLeft, Camera, Clock, FileText, Image as ImageIcon, Mic, Pause, Phone, PhoneMissed, Play, Plus, Send, Trash2, Video, X } from 'lucide-react-native';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { naira, perInterval, place } from '@/lib/k/format';
import { usePhotoGalleryScreen } from '@/lib/hooks/camera';
import { AUDIO_EXTENSIONS } from '@/lib/utils/file';
import { IconButton } from './button';
import { Avatar, Photo } from './surface';
import { KText } from './text';
import { Row } from './feedback';
import { Sheet } from './sheet';

// ── Types ──────────────────────────────────────────────────────

export type ChatAsset = { id: string; asset: { id: string; publicUrl: string; contentType?: string | null; originalFilename?: string | null } };
export type ChatMsg = {
	id: string;
	text: string;
	messageType?: string | null;
	callType?: string | null;
	isSender: boolean;
	createdAt: string;
	lastUpdated: string;
	assets: ChatAsset[];
	sender?: { id: string; profile?: { fullName?: string | null } | null } | null;
	/** Local-only: still uploading / failed to send. */
	state?: 'sending' | 'failed';
	/** Local-only: files picked for an unsent message. */
	local?: Attachment[];
};
export type Attachment = { uri: string; kind: 'image' | 'document' | 'audio'; name?: string; mimeType?: string | null };

// ── Header ─────────────────────────────────────────────────────

type HeaderListing = { id: string; title?: string | null; city?: string | null; state?: string | null; price?: number | null; paymentInterval?: string | null; coverImage?: { asset?: { id: string } | null } | null };

export function ChatHeader({
	name,
	avatar,
	online,
	lastSeen,
	listing,
	onVoice,
	onVideo,
	onProfile,
	maxWidth
}: {
	name?: string | null;
	avatar?: string | null;
	online?: boolean;
	lastSeen?: string | null;
	listing?: HeaderListing | null;
	onVoice?: () => void;
	onVideo?: () => void;
	onProfile?: () => void;
	maxWidth?: number;
}) {
	const insets = useSafeAreaInsets();
	const presence = online ? 'Online' : lastSeen ? `Last seen ${lastSeenLabel(lastSeen)}` : '';
	return (
		<View style={[s.header, { paddingTop: insets.top + 8 }]}>
			<View style={[{ gap: 10 }, maxWidth ? { width: '100%', maxWidth, alignSelf: 'center' } : null]}>
				<View style={s.headRow}>
					<IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/inbox'))}>
						<ArrowLeft size={19} color={color.fg} />
					</IconButton>
					<Pressable onPress={onProfile} disabled={!onProfile} accessibilityRole="button" accessibilityLabel={`${name ?? 'Contact'}${presence ? `, ${presence}` : ''}. View profile`} style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
						<View>
							<Avatar name={name} uri={avatar} size={40} />
							{online ? <View style={s.online} /> : null}
						</View>
						<View style={{ flex: 1, minWidth: 0 }}>
							<KText v="bodyStrong" numberOfLines={1} testID="chat-name">
								{name ?? ' '}
							</KText>
							{presence ? (
								<KText v="xs" c={online ? 'success' : 'muted'} numberOfLines={1}>
									{presence}
								</KText>
							) : null}
						</View>
					</Pressable>
					{onVoice ? (
						<IconButton label="Voice call" onPress={onVoice}>
							<Phone size={18} color={color.fg} />
						</IconButton>
					) : null}
					{onVideo ? (
						<IconButton label="Video call" onPress={onVideo}>
							<Video size={18} color={color.fg} />
						</IconButton>
					) : null}
				</View>
				{listing ? (
					<Pressable onPress={() => router.push(`/hostings/${listing.id}`)} accessibilityRole="button" accessibilityLabel={`About ${listing.title ?? 'this home'}. Open listing`} style={({ pressed }) => [s.listing, pressed && { opacity: 0.8 }]} testID="chat-listing">
						<Photo assetId={listing.coverImage?.asset?.id} w={160} h={120} style={{ width: 40, height: 32 }} radius={radius.sm} />
						<View style={{ flex: 1, minWidth: 0 }}>
							<KText v="smallStrong" numberOfLines={1}>
								{listing.title}
							</KText>
							<KText v="xs" numberOfLines={1}>
								{place(listing.city, listing.state)}
								{listing.price ? ` · ${naira(listing.price)} ${perInterval(listing.paymentInterval)}` : ''}
							</KText>
						</View>
						<KText v="micro" c="amber">
							View
						</KText>
					</Pressable>
				) : null}
			</View>
		</View>
	);
}

function lastSeenLabel(iso: string) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const mins = Math.round((Date.now() - d.getTime()) / 6e4);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins} min ago`;
	const sameDay = new Date().toDateString() === d.toDateString();
	const time = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
	if (sameDay) return `today at ${time}`;
	return `${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} at ${time}`;
}

// ── Messages ───────────────────────────────────────────────────

const isAudio = (a: ChatAsset) => !!a.asset.contentType?.includes('audio') || AUDIO_EXTENSIONS.some((e) => a.asset.publicUrl.toLowerCase().endsWith(`.${e}`));
const isImage = (a: ChatAsset) => !!a.asset.contentType?.includes('image');
export const timeOf = (iso: string) => {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
};

export function DayDivider({ iso }: { iso: string }) {
	const d = new Date(iso);
	const today = new Date();
	const y = new Date(Date.now() - 864e5);
	const label =
		d.toDateString() === today.toDateString()
			? 'Today'
			: d.toDateString() === y.toDateString()
				? 'Yesterday'
				: d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) });
	return (
		<View style={s.day} accessibilityRole="header">
			<View style={s.dayLine} />
			<KText v="micro">{label}</KText>
			<View style={s.dayLine} />
		</View>
	);
}

export const MessageBubble = memo(function MessageBubble({ m, last, onRetry, onDiscard }: { m: ChatMsg; last: boolean; onRetry?: (m: ChatMsg) => void; onDiscard?: (m: ChatMsg) => void }) {
	const { redirect: openGallery } = usePhotoGalleryScreen();
	const mine = m.isSender;
	const time = timeOf(m.createdAt);

	if (m.messageType === 'missed_call' || m.messageType === 'accepted_call') {
		const missed = m.messageType === 'missed_call';
		const Icon = missed ? PhoneMissed : m.callType === 'video' ? Video : Phone;
		return (
			<View style={[s.event, { alignSelf: 'center' }]} accessibilityLabel={`${m.text}, ${time}`}>
				<Icon size={14} color={missed ? color.danger : color.fg2} />
				<KText v="xs" style={{ color: missed ? color.danger : color.fg2 }}>
					{m.text} · {time}
				</KText>
			</View>
		);
	}

	const remote = m.assets ?? [];
	const audio = remote.find(isAudio);
	const images = m.local ? m.local.filter((x) => x.kind === 'image').map((x) => x.uri) : remote.filter(isImage).map((a) => a.asset.publicUrl);
	const docs = m.local ? m.local.filter((x) => x.kind === 'document').map((x) => ({ key: x.uri, name: x.name ?? 'Document', url: null as string | null })) : remote.filter((a) => !isImage(a) && !isAudio(a)).map((a) => ({ key: a.id, name: a.asset.originalFilename ?? 'Document', url: a.asset.publicUrl }));
	const localAudio = m.local?.find((x) => x.kind === 'audio');
	const text = m.text?.trim();
	const status = m.state === 'sending' ? 'Sending' : m.state === 'failed' ? 'Not sent' : '';
	const label = `${mine ? 'You' : (m.sender?.profile?.fullName ?? 'Them')}: ${text || (images.length ? `${images.length} photo${images.length > 1 ? 's' : ''}` : audio || localAudio ? 'Voice note' : docs.length ? 'Document' : '')}, ${time}${status ? `, ${status}` : ''}`;

	return (
		<View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', marginBottom: last ? 10 : 3, gap: 4, opacity: m.state === 'sending' ? 0.75 : 1 }} accessible accessibilityLabel={label}>
			{images.length ? (
				<View style={[s.images, images.length === 1 && { width: 240 }]}>
					{images.slice(0, 4).map((uri, i) => (
						<Pressable
							key={`${i}:${uri}`}
							disabled={!!m.local}
							onPress={() => openGallery({ redirect: '/inbox', images, activeIndex: i, viewOnly: true, push: true })}
							accessibilityRole="imagebutton"
							accessibilityLabel={`Open photo ${i + 1} of ${images.length}`}
							style={[{ width: images.length === 1 ? 240 : 118, height: images.length === 1 ? 180 : 118, borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.surface }]}
						>
							<Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} cachePolicy="memory-disk" />
							{i === 3 && images.length > 4 ? (
								<View style={[StyleSheet.absoluteFill, { backgroundColor: color.scrim, alignItems: 'center', justifyContent: 'center' }]}>
									<KText v="heading">+{images.length - 4}</KText>
								</View>
							) : null}
						</Pressable>
					))}
				</View>
			) : null}
			{docs.map((d) => (
				<Pressable key={d.key} disabled={!d.url} onPress={() => d.url && WebBrowser.openBrowserAsync(d.url).catch(() => {})} accessibilityRole="button" accessibilityLabel={`Open ${d.name}`} style={({ pressed }) => [s.doc, mine && s.docMine, pressed && { opacity: 0.8 }]}>
					<FileText size={18} color={color.amber} />
					<KText v="small" numberOfLines={1} style={{ flex: 1, color: color.fg }}>
						{d.name}
					</KText>
				</Pressable>
			))}
			{audio || localAudio ? (
				<View style={[s.bubble, mine ? s.mine : s.theirs]}>
					<VoiceNote url={audio?.asset.publicUrl ?? localAudio!.uri} mine={mine} />
				</View>
			) : null}
			{text ? (
				<View style={[s.bubble, mine ? s.mine : s.theirs, m.state === 'failed' && { borderColor: color.danger, borderWidth: 1 }]}>
					<KText v="body" selectable style={{ color: mine ? color.onAmber : color.fg, fontSize: 15, lineHeight: 21 }}>
						{text}
					</KText>
				</View>
			) : null}
			{m.state === 'failed' ? (
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-end' }}>
					<AlertCircle size={13} color={color.danger} />
					<KText v="xs" c="danger">
						Not sent
					</KText>
					<Pressable onPress={() => onRetry?.(m)} accessibilityRole="button" accessibilityLabel="Retry sending" hitSlop={8}>
						<KText v="xs" style={{ color: color.fg, fontFamily: font.bodySemi, textDecorationLine: 'underline' }}>
							Retry
						</KText>
					</Pressable>
					<Pressable onPress={() => onDiscard?.(m)} accessibilityRole="button" accessibilityLabel="Delete unsent message" hitSlop={8}>
						<KText v="xs" style={{ textDecorationLine: 'underline' }}>
							Delete
						</KText>
					</Pressable>
				</View>
			) : last ? (
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: mine ? 'flex-end' : 'flex-start', paddingHorizontal: 4 }}>
					{m.state === 'sending' ? <Clock size={10} color={color.dim} /> : null}
					<KText v="xs" style={{ fontSize: 11 }}>
						{m.state === 'sending' ? 'Sending…' : time}
					</KText>
				</View>
			) : null}
		</View>
	);
});

const BARS = [0.3, 0.5, 0.7, 0.9, 0.6, 0.8, 1, 0.7, 0.5, 0.65, 0.85, 0.95, 0.6, 0.45, 0.7, 0.9, 0.6, 0.4, 0.55, 0.75, 0.5, 0.3];

function VoiceNote({ url, mine }: { url: string; mine: boolean }) {
	const player = useAudioPlayer(url);
	const st = useAudioPlayerStatus(player);
	const total = st.duration || 0;
	const progress = total > 0 ? st.currentTime / total : 0;
	const fg = mine ? color.onAmber : color.fg;
	const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 200 }}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={st.playing ? 'Pause voice note' : 'Play voice note'}
				onPress={() => {
					if (st.playing) return player.pause();
					if (total > 0 && st.currentTime >= total) player.seekTo(0);
					player.play();
				}}
				style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: mine ? 'rgba(18,12,2,0.14)' : color.surface2 }}
			>
				{st.playing ? <Pause size={15} color={fg} fill={fg} /> : <Play size={15} color={fg} fill={fg} />}
			</Pressable>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 24 }}>
				{BARS.map((b, i) => (
					<View key={i} style={{ flex: 1, height: Math.max(3, b * 22), borderRadius: 1, backgroundColor: fg, opacity: i / BARS.length <= progress ? 1 : 0.3 }} />
				))}
			</View>
			<KText v="xs" style={{ color: fg, fontVariant: ['tabular-nums'], minWidth: 30, textAlign: 'right' }}>
				{fmt(st.playing || st.currentTime > 0 ? st.currentTime : total)}
			</KText>
		</View>
	);
}

// ── Composer ───────────────────────────────────────────────────

export function Composer({ onSend, initial, maxWidth }: { onSend: (text: string, files: Attachment[]) => void; initial?: string; maxWidth?: number }) {
	const insets = useSafeAreaInsets();
	const [text, setText] = useState(initial ?? '');
	const [files, setFiles] = useState<Attachment[]>([]);
	const [menu, setMenu] = useState(false);
	const [recording, setRecording] = useState(false);
	useEffect(() => {
		if (initial) setText(initial);
	}, [initial]);
	const canSend = text.trim().length > 0 || files.length > 0;

	function send() {
		if (!canSend) return;
		onSend(text.trim(), files);
		setText('');
		setFiles([]);
	}
	async function pickPhotos() {
		setMenu(false);
		const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 10, quality: 0.8 });
		if (!r.canceled) setFiles((f) => [...f, ...r.assets.map((a) => ({ uri: a.uri, kind: 'image' as const, name: a.fileName ?? undefined, mimeType: a.mimeType }))]);
	}
	async function takePhoto() {
		setMenu(false);
		const perm = await ImagePicker.requestCameraPermissionsAsync();
		if (!perm.granted) return;
		const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
		if (!r.canceled) setFiles((f) => [...f, ...r.assets.map((a) => ({ uri: a.uri, kind: 'image' as const, name: a.fileName ?? undefined, mimeType: a.mimeType }))]);
	}
	async function pickDocs() {
		setMenu(false);
		const r = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
		if (!r.canceled) setFiles((f) => [...f, ...r.assets.map((a) => ({ uri: a.uri, kind: 'document' as const, name: a.name, mimeType: a.mimeType }))]);
	}

	return (
		<View style={[s.composerWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
			<View style={[{ gap: 8 }, maxWidth ? { width: '100%', maxWidth, alignSelf: 'center' } : null]}>
				{files.length ? (
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityLabel={`${files.length} attachment${files.length > 1 ? 's' : ''} ready to send`}>
						{files.map((f, i) => (
							<View key={`${i}:${f.uri}`} style={s.tray}>
								{f.kind === 'image' ? (
									<Image source={{ uri: f.uri }} style={{ width: 56, height: 56, borderRadius: radius.sm }} contentFit="cover" />
								) : (
									<View style={s.trayDoc}>
										<FileText size={16} color={color.amber} />
										<KText v="xs" numberOfLines={2} style={{ color: color.fg2 }}>
											{f.name}
										</KText>
									</View>
								)}
								<Pressable onPress={() => setFiles((all) => all.filter((_, j) => j !== i))} accessibilityRole="button" accessibilityLabel={`Remove ${f.name ?? 'attachment'}`} hitSlop={8} style={s.trayX}>
									<X size={11} color={color.bg} />
								</Pressable>
							</View>
						))}
					</View>
				) : null}
				{recording ? (
					<Recorder
						onCancel={() => setRecording(false)}
						onDone={(uri) => {
							setRecording(false);
							onSend('', [{ uri, kind: 'audio', name: uri.split('/').pop() }]);
						}}
					/>
				) : (
					<View style={s.composer}>
						<IconButton label="Add photo or file" onPress={() => setMenu(true)} size={40}>
							<Plus size={19} color={color.fg} />
						</IconButton>
						<TextInput
							value={text}
							onChangeText={setText}
							placeholder="Message"
							placeholderTextColor={color.dim}
							multiline
							style={s.input}
							selectionColor={color.amber}
							cursorColor={color.amber}
							accessibilityLabel="Message"
							testID="chat-input"
						/>
						{canSend ? (
							<IconButton label="Send" tone="amber" onPress={send} size={40}>
								<Send size={17} color={color.onAmber} />
							</IconButton>
						) : (
							<IconButton label="Record a voice note" onPress={() => setRecording(true)} size={40}>
								<Mic size={18} color={color.fg} />
							</IconButton>
						)}
					</View>
				)}
			</View>
			<Sheet open={menu} onClose={() => setMenu(false)} title="Attach">
				<Row icon={<ImageIcon size={17} color={color.fg2} />} title="Photo library" detail="Up to 10 photos" onPress={pickPhotos} />
				<Row icon={<Camera size={17} color={color.fg2} />} title="Take a photo" onPress={takePhoto} />
				<Row icon={<FileText size={17} color={color.fg2} />} title="Document" detail="PDF, receipts, IDs" onPress={pickDocs} />
			</Sheet>
		</View>
	);
}

function Recorder({ onDone, onCancel }: { onDone: (uri: string) => void; onCancel: () => void }) {
	const rec = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
	const st = useAudioRecorderState(rec, 120);
	const [levels, setLevels] = useState<number[]>(Array(28).fill(0.08));
	const reset = () => setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
	useEffect(() => {
		(async () => {
			try {
				const perm = await AudioModule.requestRecordingPermissionsAsync();
				if (!perm.granted) return onCancel();
				// iOS needs a recording-capable session before preparing; reset after.
				await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
				await rec.prepareToRecordAsync();
				rec.record();
			} catch {
				await reset();
				onCancel();
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (st.isRecording && typeof st.metering === 'number') {
			const lvl = Math.max(0.08, 1 + Math.max(-60, Math.min(0, st.metering)) / 60);
			setLevels((p) => [...p.slice(1), lvl]);
		}
	}, [st.metering, st.isRecording]);
	async function stop(send: boolean) {
		try {
			if (st.isRecording) await rec.stop();
		} catch {}
		await reset();
		const uri = rec.uri ?? st.url;
		if (send && uri) onDone(uri);
		else onCancel();
	}
	const secs = Math.floor(st.durationMillis / 1000);
	return (
		<View style={s.composer} accessibilityLabel={`Recording voice note, ${secs} seconds`}>
			<IconButton label="Discard voice note" onPress={() => stop(false)} size={40}>
				<Trash2 size={17} color={color.danger} />
			</IconButton>
			<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.danger }} />
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 30 }}>
				{levels.map((l, i) => (
					<View key={i} style={{ flex: 1, height: Math.max(3, l * 28), borderRadius: 1, backgroundColor: color.amber }} />
				))}
			</View>
			<KText v="smallStrong" style={{ fontVariant: ['tabular-nums'] }}>
				{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
			</KText>
			<IconButton label="Send voice note" tone="amber" onPress={() => stop(true)} size={40}>
				<Send size={17} color={color.onAmber} />
			</IconButton>
		</View>
	);
}

const s = StyleSheet.create({
	header: { paddingHorizontal: gutter, paddingBottom: 10, backgroundColor: color.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.line },
	headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	online: { position: 'absolute', right: 0, bottom: 0, width: 11, height: 11, borderRadius: 6, backgroundColor: color.success, borderWidth: 2, borderColor: color.bg },
	listing: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	day: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
	dayLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: color.line2 },
	event: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: color.line2, marginVertical: 8 },
	bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
	mine: { backgroundColor: color.amber, borderBottomRightRadius: 6 },
	theirs: { backgroundColor: color.surface2, borderBottomLeftRadius: 6 },
	images: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, width: 240 },
	doc: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, minWidth: 200 },
	docMine: { borderColor: color.amberLine },
	composerWrap: { paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, backgroundColor: color.bg },
	composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
	input: { flex: 1, minHeight: 40, maxHeight: 140, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 20, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, color: color.fg, fontFamily: font.body, fontSize: 15 },
	tray: { width: 56, height: 56 },
	trayDoc: { width: 56, height: 56, borderRadius: radius.sm, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, padding: 4, gap: 2, alignItems: 'center', justifyContent: 'center' },
	trayX: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: color.fg, alignItems: 'center', justifyContent: 'center' }
});
