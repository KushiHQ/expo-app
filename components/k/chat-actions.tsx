/**
 * WhatsApp-style chat extras: tappable links / phone numbers / emails in
 * bubbles, the long-press message menu (reply, copy, edit), swipe-to-reply and
 * the quoted-message block.
 */
import { memo, useEffect, useState, type ReactNode } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Copy, ExternalLink, Mail, MessageCircle, Pencil, Phone, Reply } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { linkify, type Segment } from '@/lib/k/linkify';
import { toast } from '@/lib/hooks/use-toast';
import { Pressable } from './pressable';
import { KText } from './text';
import { Row } from './feedback';
import { Sheet } from './sheet';

/** Text messages can be edited for this long after sending (matches the API). */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;

export type ReplyRef = {
	id: string;
	text: string;
	messageType?: string | null;
	isSender: boolean;
	sender?: { id: string; profile?: { fullName?: string | null } | null } | null;
	assets?: { id: string; asset: { id: string; contentType?: string | null } }[] | null;
};

/** One line describing a message, for reply previews and quotes. */
export function snippetOf(m: Pick<ReplyRef, 'text' | 'messageType' | 'assets'>) {
	const text = m.text?.trim();
	if (text) return text.replace(/\s+/g, ' ');
	const assets = m.assets ?? [];
	if (assets.some((a) => a.asset.contentType?.includes('image'))) return assets.length > 1 ? `${assets.length} photos` : 'Photo';
	if (assets.some((a) => a.asset.contentType?.includes('audio'))) return 'Voice note';
	if (assets.length) return 'Document';
	return 'Message';
}

export function canEditMessage(m: { isSender: boolean; messageType?: string | null; text?: string | null; createdAt: string; state?: string; id: string }) {
	return (
		m.isSender &&
		!m.messageType &&
		!!m.text?.trim() &&
		!m.state &&
		!m.id.startsWith('local-') &&
		Date.now() - new Date(m.createdAt).getTime() < EDIT_WINDOW_MS
	);
}

const copy = async (value: string, what: string) => {
	await Clipboard.setStringAsync(value);
	Haptics.selectionAsync().catch(() => {});
	toast.show({ type: 'success', text2: `${what} copied` });
};

// ── Tappable text ──────────────────────────────────────────────────────────

// One sheet for the whole conversation; any bubble can open it.
let openLink: ((seg: Segment) => void) | null = null;

/** Message text with links, phone numbers and emails underlined and tappable. */
export const RichText = memo(function RichText({ text, mine, onLongPress }: { text: string; mine: boolean; onLongPress?: () => void }) {
	const fg = mine ? color.onAmber : color.fg;
	const segs = linkify(text);
	return (
		<KText v="body" onLongPress={onLongPress} style={{ color: fg, fontSize: 15, lineHeight: 21 }}>
			{segs.map((seg, i) =>
				seg.kind === 'text' ? (
					seg.text
				) : (
					<Text
						key={i}
						suppressHighlighting={false}
						accessibilityRole="link"
						accessibilityHint={seg.kind === 'phone' ? 'Call, message or copy this number' : seg.kind === 'email' ? 'Email or copy this address' : 'Opens the link'}
						onPress={() => {
							if (seg.kind === 'url') WebBrowser.openBrowserAsync(seg.href).catch(() => Linking.openURL(seg.href).catch(() => {}));
							else openLink?.(seg);
						}}
						onLongPress={() => openLink?.(seg)}
						style={{ color: fg, textDecorationLine: 'underline', fontFamily: font.bodySemi }}
					>
						{seg.text}
					</Text>
				)
			)}
		</KText>
	);
});

/** Host for the call / copy / email sheet. Render once per conversation. */
export function LinkSheetHost() {
	const [seg, setSeg] = useState<Segment | null>(null);
	useEffect(() => {
		openLink = (s) => {
			Haptics.selectionAsync().catch(() => {});
			setSeg(s);
		};
		return () => {
			openLink = null;
		};
	}, []);
	const close = () => setSeg(null);
	const run = (fn: () => unknown) => () => {
		close();
		Promise.resolve(fn()).catch(() => {});
	};
	return (
		<Sheet open={!!seg} onClose={close} title={seg?.text} scroll={false}>
			{seg?.kind === 'phone' ? (
				<>
					<Row icon={<Phone size={17} color={color.fg2} />} title="Call" detail={seg.text} onPress={run(() => Linking.openURL(seg.href))} />
					<Row icon={<MessageCircle size={17} color={color.fg2} />} title="Message on WhatsApp" onPress={run(() => Linking.openURL(seg.whatsapp))} />
					<Row icon={<Copy size={17} color={color.fg2} />} title="Copy number" onPress={run(() => copy(seg.text, 'Number'))} />
				</>
			) : seg?.kind === 'email' ? (
				<>
					<Row icon={<Mail size={17} color={color.fg2} />} title="Send email" onPress={run(() => Linking.openURL(seg.href))} />
					<Row icon={<Copy size={17} color={color.fg2} />} title="Copy address" onPress={run(() => copy(seg.text, 'Address'))} />
				</>
			) : seg?.kind === 'url' ? (
				<>
					<Row icon={<ExternalLink size={17} color={color.fg2} />} title="Open link" onPress={run(() => WebBrowser.openBrowserAsync(seg.href))} />
					<Row icon={<Copy size={17} color={color.fg2} />} title="Copy link" onPress={run(() => copy(seg.text, 'Link'))} />
				</>
			) : null}
		</Sheet>
	);
}

// ── Long-press menu ────────────────────────────────────────────────────────

export function MessageActionsSheet<M extends { id: string; text: string; isSender: boolean; messageType?: string | null; createdAt: string; state?: string }>({
	message,
	onClose,
	onReply,
	onEdit
}: {
	message: M | null;
	onClose: () => void;
	onReply: (m: M) => void;
	onEdit: (m: M) => void;
}) {
	const m = message;
	const text = m?.text?.trim();
	const run = (fn: () => unknown) => () => {
		onClose();
		Promise.resolve(fn()).catch(() => {});
	};
	return (
		<Sheet open={!!m} onClose={onClose} scroll={false}>
			{m && !m.state ? <Row icon={<Reply size={17} color={color.fg2} />} title="Reply" onPress={run(() => onReply(m))} /> : null}
			{m && text ? <Row icon={<Copy size={17} color={color.fg2} />} title="Copy" onPress={run(() => copy(text, 'Message'))} /> : null}
			{m && canEditMessage(m) ? <Row icon={<Pencil size={17} color={color.fg2} />} title="Edit" detail="Within 15 minutes of sending" onPress={run(() => onEdit(m))} /> : null}
		</Sheet>
	);
}

// ── Swipe to reply ─────────────────────────────────────────────────────────

const TRIGGER = 56;
const MAX = 84;

/** Swipe a message to the right to reply to it. */
export function SwipeToReply({ children, onReply, enabled = true }: { children: ReactNode; onReply: () => void; enabled?: boolean }) {
	const x = useSharedValue(0);
	const armed = useSharedValue(false);
	const buzz = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
	const pan = Gesture.Pan()
		.enabled(enabled)
		// Only a clear rightward drag; vertical movement keeps scrolling the list.
		.activeOffsetX([-1000, 14])
		.failOffsetY([-12, 12])
		.onUpdate((e) => {
			const t = Math.max(0, Math.min(MAX, e.translationX * 0.6));
			x.value = t;
			if (t >= TRIGGER && !armed.value) {
				armed.value = true;
				runOnJS(buzz)();
			} else if (t < TRIGGER && armed.value) {
				armed.value = false;
			}
		})
		.onEnd(() => {
			if (armed.value) runOnJS(onReply)();
			armed.value = false;
			x.value = withSpring(0, { damping: 18, stiffness: 220 });
		})
		.onFinalize(() => {
			x.value = withSpring(0, { damping: 18, stiffness: 220 });
		});
	const row = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
	const icon = useAnimatedStyle(() => ({
		opacity: interpolate(x.value, [0, TRIGGER], [0, 1]),
		transform: [{ scale: interpolate(x.value, [0, TRIGGER, MAX], [0.6, 1, 1.1]) }]
	}));
	return (
		<GestureDetector gesture={pan}>
			<View>
				<Animated.View style={[s.replyIcon, icon]} pointerEvents="none">
					<Reply size={16} color={color.fg} />
				</Animated.View>
				<Animated.View style={row}>{children}</Animated.View>
			</View>
		</GestureDetector>
	);
}

// ── Quote ──────────────────────────────────────────────────────────────────

/** The quoted message at the top of a reply bubble (or above the composer). */
export function ReplyQuote({ reply, mine, onPress, onClose }: { reply: ReplyRef; mine?: boolean; onPress?: () => void; onClose?: () => void }) {
	const who = reply.isSender ? 'You' : (reply.sender?.profile?.fullName ?? 'Them');
	const inBubble = mine !== undefined;
	const fg = inBubble && mine ? color.onAmber : color.fg;
	return (
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			accessibilityRole={onPress ? 'button' : undefined}
			accessibilityLabel={`Reply to ${who}: ${snippetOf(reply)}`}
			style={[s.quote, inBubble ? { backgroundColor: mine ? 'rgba(18,12,2,0.10)' : 'rgba(255,255,255,0.06)' } : s.quoteBar]}
		>
			<View style={[s.quoteEdge, { backgroundColor: inBubble && mine ? color.onAmber : color.amber }]} />
			<View style={{ flex: 1, gap: 1 }}>
				<KText v="xs" style={{ color: inBubble && mine ? color.onAmber : color.amber, fontFamily: font.bodySemi }} numberOfLines={1}>
					{onClose ? `Replying to ${who}` : who}
				</KText>
				<KText v="xs" style={{ color: fg, opacity: 0.85 }} numberOfLines={2}>
					{snippetOf(reply)}
				</KText>
			</View>
			{onClose ? (
				<Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel reply" style={{ padding: 4 }}>
					<KText v="small">✕</KText>
				</Pressable>
			) : null}
		</Pressable>
	);
}

const s = StyleSheet.create({
	replyIcon: { position: 'absolute', left: 4, top: 0, bottom: 0, width: 30, height: 30, marginVertical: 'auto', alignSelf: 'center', borderRadius: 15, backgroundColor: color.surface2, alignItems: 'center', justifyContent: 'center' },
	quote: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.sm, paddingVertical: 6, paddingRight: 8, overflow: 'hidden' },
	quoteBar: { backgroundColor: color.bg2, borderWidth: 1, borderColor: color.line2, paddingRight: 10 },
	quoteEdge: { width: 3, alignSelf: 'stretch', borderRadius: 2 }
});
