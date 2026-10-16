/**
 * Support conversation pieces: message bubble, composer and the
 * "how did we do?" rating sheet.
 */
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, FileText, SendHorizontal, Star } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { useLayout } from '@/lib/k/layout';
import { cleanError } from '@/lib/k/account';
import { useSubmitSupportRatingMutation } from '@/lib/services/graphql/generated';
import { Pressable } from './pressable';
import { KText } from './text';
import { Button, IconButton } from './button';
import { Field } from './form';
import { Notice } from './feedback';
import { Sheet } from './sheet';
import { Photo } from './surface';

export type Bubble = {
	id: string;
	text?: string | null;
	createdAt: string;
	mine: boolean;
	staff: boolean;
	name?: string | null;
	state?: 'sending' | 'failed';
	assets?: { id: string; asset?: { id: string; publicUrl?: string | null; contentType?: string | null; originalFilename?: string | null } | null }[] | null;
};

const TIME = new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit' });

export function MessageBubble({ m, first, onRetry }: { m: Bubble; first: boolean; onRetry?: () => void }) {
	const { compact } = useLayout();
	const time = TIME.format(new Date(m.createdAt));
	return (
		<View style={{ alignItems: m.mine ? 'flex-end' : 'flex-start', marginTop: first ? 12 : 3 }}>
			{first && !m.mine ? (
				<KText v="micro" style={{ marginBottom: 4, marginLeft: 4 }}>
					{m.staff ? `${m.name ?? 'Kushi'} · Kushi Support` : (m.name ?? 'Kushi Support')}
				</KText>
			) : null}
			<Pressable
				disabled={m.state !== 'failed'}
				onPress={onRetry}
				accessibilityLabel={`${m.mine ? 'You' : (m.name ?? 'Kushi Support')}: ${m.text ?? 'attachment'}. ${m.state === 'failed' ? 'Not sent. Tap to retry.' : m.state === 'sending' ? 'Sending' : time}`}
				style={[s.bubble, { maxWidth: compact ? '82%' : 520 }, m.mine ? s.mine : s.theirs, m.state === 'failed' && { borderColor: color.danger }]}
			>
				{(m.assets ?? []).map((a) =>
					a.asset?.contentType?.startsWith('image') ? (
						<Photo key={a.id} uri={a.asset?.publicUrl} style={{ width: 200, height: 150, marginBottom: 6 }} />
					) : (
						<View key={a.id} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 6 }}>
							<FileText size={14} color={color.fg2} />
							<KText v="xs" c="fg2" numberOfLines={1}>
								{a.asset?.originalFilename ?? 'Attachment'}
							</KText>
						</View>
					)
				)}
				{m.text ? (
					<KText v="body" style={{ color: m.mine ? color.onAmber : color.fg }} selectable>
						{m.text}
					</KText>
				) : null}
			</Pressable>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, marginHorizontal: 4 }}>
				{m.state === 'failed' ? <AlertCircle size={12} color={color.danger} /> : null}
				<KText v="xs" c={m.state === 'failed' ? 'danger' : 'dim'}>
					{m.state === 'failed' ? 'Not sent — tap to retry' : m.state === 'sending' ? 'Sending…' : time}
				</KText>
			</View>
		</View>
	);
}

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
	const insets = useSafeAreaInsets();
	const [text, setText] = useState('');
	const ready = text.trim().length > 0 && !disabled;
	return (
		<View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
			<TextInput
				value={text}
				onChangeText={setText}
				placeholder="Write a message"
				placeholderTextColor={color.dim}
				selectionColor={color.amber}
				multiline
				maxLength={2000}
				editable={!disabled}
				accessibilityLabel="Message to Kushi Support"
				style={s.input}
				testID="support-input"
			/>
			<IconButton
				label="Send message"
				tone={ready ? 'amber' : 'ghost'}
				disabled={!ready}
				onPress={() => {
					onSend(text.trim());
					setText('');
				}}
			>
				<SendHorizontal size={18} color={ready ? color.onAmber : color.muted} />
			</IconButton>
		</View>
	);
}

export function RatingSheet({ open, chatId, onClose, onRated }: { open: boolean; chatId: string; onClose: () => void; onRated: () => void }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, submit] = useSubmitSupportRatingMutation();
	return (
		<Sheet open={open} onClose={onClose} eyebrow="Conversation closed" title="How did we do?">
			<KText v="small">Rate this conversation so we know what to keep doing and what to fix.</KText>
			<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
				{[1, 2, 3, 4, 5].map((n) => (
					<Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} onPress={() => setRating(n)} hitSlop={6} style={{ padding: 4 }}>
						<Star size={30} color={n <= rating ? color.amber : color.dim} fill={n <= rating ? color.amber : 'transparent'} />
					</Pressable>
				))}
			</View>
			<Field label="Anything to add?" optional multiline value={comment} onChangeText={setComment} maxLength={1000} />
			{error ? <Notice tone="danger">{error}</Notice> : null}
			<Button
				title="Send rating"
				size="lg"
				block
				loading={fetching}
				disabled={!rating}
				onPress={async () => {
					setError(null);
					const r = await submit({ input: { chatId, rating, comment: comment.trim() || undefined } });
					if (r.error) return setError(cleanError(r.error.message));
					onRated();
				}}
			/>
			<Button title="Not now" variant="ghost" size="lg" block onPress={onClose} />
		</Sheet>
	);
}

const s = StyleSheet.create({
	bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1 },
	mine: { backgroundColor: color.amber, borderColor: color.amber, borderBottomRightRadius: radius.sm },
	theirs: { backgroundColor: color.surface, borderColor: color.line, borderBottomLeftRadius: radius.sm },
	composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, backgroundColor: color.bg },
	input: { flex: 1, minHeight: 44, maxHeight: 140, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2, color: color.fg, fontFamily: font.body, fontSize: 16 }
});
