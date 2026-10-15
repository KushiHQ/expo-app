/**
 * Shared pieces of the guest booking journey: the journey track, the money
 * breakdown, the receipt, the tenancy agreement viewer, the cancellation
 * preview, the review card, and the redirects that send old links (bookings,
 * applications, reservation steps) to the one canonical screen.
 */
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { useQuery } from 'urql';
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf';
import { Download, Star } from 'lucide-react-native';
import { Pressable } from '@/components/k/pressable';
import { color, font, radius } from '@/lib/k/theme';
import { dateTime, naira } from '@/lib/k/format';
import { JOURNEY, type Stage } from '@/lib/k/journey';
import { APPLICATION_ROUTE, BOOKING_ROUTE, GRACE_DAYS, REFUND_DAYS, cancelRefund, clean, feeLines, num, type TripBooking } from '@/lib/k/booking';
import { useUserStore } from '@/lib/stores/users';
import { useDownlods } from '@/lib/hooks/downloads';
import { openLocalFile } from '@/lib/utils/file';
import { toast } from '@/lib/hooks/use-toast';
import { useCreateUpdateHostingReviewMutation, useGuestBookingTenancyAgreementPreviewQuery } from '@/lib/services/graphql/generated';
import { Button } from './button';
import { Card, Divider, Skeleton, Spinner, Waypoint } from './surface';
import { KText, Eyebrow } from './text';
import { Sheet } from './sheet';
import { Empty, KV, Notice } from './feedback';

// ── Journey ────────────────────────────────────────────────────

/** Four waypoints from applying to the handover, with what's done in amber. */
export function JourneyTrack({ step, labels, notes }: { step: number; labels?: Partial<Record<(typeof JOURNEY)[number]['key'], string>>; notes?: Partial<Record<(typeof JOURNEY)[number]['key'], string>> }) {
	return (
		<View style={{ flexDirection: 'row' }} accessible accessibilityLabel={`Progress: ${JOURNEY.map((w, i) => `${labels?.[w.key] ?? w.label}${step >= i ? ' done' : ''}`).join(', ')}`}>
			{JOURNEY.map((w, i) => (
				<View key={w.key} style={{ flex: 1, gap: 8 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Waypoint done={step >= i} active={step + 1 === i} size={12} />
						{i < JOURNEY.length - 1 ? <View style={{ flex: 1, height: 1, backgroundColor: step > i ? color.amber : color.line2, marginHorizontal: 4 }} /> : null}
					</View>
					<KText v="micro" style={{ color: step >= i || step + 1 === i ? color.fg : color.muted, paddingRight: 6 }}>
						{labels?.[w.key] ?? w.label}
					</KText>
					{notes?.[w.key] ? (
						<KText v="xs" style={{ paddingRight: 6 }}>
							{notes[w.key]}
						</KText>
					) : null}
				</View>
			))}
		</View>
	);
}

// ── Money ──────────────────────────────────────────────────────

/** Itemised charges; the lines add up to the total the guest pays. */
export function FeeBreakdown({ booking, stage }: { booking: TripBooking; stage: Stage }) {
	const paid = booking.paymentStatus === 'PAID';
	const lines = feeLines(booking);
	return (
		<Card>
			<KText v="heading">{paid ? 'What you paid' : 'What you’ll pay'}</KText>
			{lines.map((l) => (
				<View key={l.label} style={{ gap: 2 }}>
					<KV k={l.label} v={naira(l.amount)} />
					{l.description ? <KText v="xs">{l.description}</KText> : null}
				</View>
			))}
			<Divider />
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
				<KText v="bodyStrong">Total</KText>
				<KText v="money">{naira(num(booking.amount))}</KText>
			</View>
			{paid && stage !== 'ended' ? <KText v="xs">Held by Kushi in escrow until the handover. The Kushi platform fee isn’t refundable once you’ve paid.</KText> : null}
			{!paid ? <KText v="xs">Paid to Kushi, not the host. The host is paid only after you confirm the handover.</KText> : null}
		</Card>
	);
}

/** Payment receipt: reference, date, method and the itemised charges. */
export function ReceiptSheet({ open, onClose, booking, title }: { open: boolean; onClose: () => void; booking: TripBooking; title: string }) {
	const tx = booking.transaction;
	return (
		<Sheet open={open} onClose={onClose} title="Receipt" eyebrow="Kushi Housing">
			<View style={{ gap: 4 }}>
				<KText v="label">Amount paid</KText>
				<KText v="display">{naira(num(booking.amount))}</KText>
				<KText v="small">{title}</KText>
			</View>
			<Card>
				<KV k="Booking reference" v={booking.bookingReference} />
				{tx?.reference ? <KV k="Payment reference" v={tx.reference} /> : null}
				<KV k="Paid on" v={dateTime(tx?.lastUpdated ?? booking.lastUpdated)} />
				{booking.paymentMethod ? <KV k="Method" v={booking.paymentMethod.replace(/_/g, ' ').toLowerCase()} /> : null}
				<KV k="Name" v={booking.fullName} />
				<KV k="Email" v={booking.email} />
			</Card>
			<Card>
				{feeLines(booking).map((l) => (
					<KV key={l.label} k={l.label} v={naira(l.amount)} />
				))}
				<Divider />
				<KV k="Total" v={naira(num(booking.amount))} strong />
			</Card>
			<KText v="xs">Keep this for your records. A copy was emailed to {booking.email}.</KText>
		</Sheet>
	);
}

// ── Agreement ──────────────────────────────────────────────────

/** The signed PDF after finalising; a live preview before that. */
export function AgreementSheet({ open, onClose, bookingId, pdfUrl }: { open: boolean; onClose: () => void; bookingId: string; pdfUrl?: string | null }) {
	const [{ data, error, fetching }, retry] = useGuestBookingTenancyAgreementPreviewQuery({ variables: { bookingId }, pause: !open || !!pdfUrl });
	const html = data?.guestBookingTenancyAgreementPreview;
	const { download, getLocalUri, downloading } = useDownlods();
	const [pdfFailed, setPdfFailed] = useState(false);

	async function openPdf() {
		if (!pdfUrl) return;
		const local = getLocalUri(encodeURI(pdfUrl)) ?? (await download(pdfUrl, `kushi-tenancy-${bookingId}.pdf`));
		if (local) openLocalFile(local);
		else toast.show({ type: 'error', text1: 'Couldn’t download', text2: 'Check your connection and try again.' });
	}

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title="Tenancy agreement"
			eyebrow={pdfUrl ? 'Signed copy' : 'Preview'}
			scroll={false}
			footer={pdfUrl ? <Button title="Save or share PDF" variant="ghost" block loading={downloading} icon={<Download size={16} color={color.fg} />} onPress={openPdf} /> : undefined}
		>
			{!pdfUrl ? <KText v="xs">The signed PDF is emailed to you and saved here once the booking completes.</KText> : null}
			<View style={s.doc}>
				{pdfUrl && !pdfFailed ? (
					<Pdf source={{ uri: pdfUrl, cache: true }} style={{ flex: 1, backgroundColor: '#fff' }} trustAllCerts={false} onError={() => setPdfFailed(true)} renderActivityIndicator={() => <Spinner />} />
				) : pdfUrl ? (
					<View style={s.center}>
						<KText v="small" style={{ color: '#333' }} center>
							We couldn’t show the PDF here. Save it to open it in another app.
						</KText>
					</View>
				) : html ? (
					<WebView originWhitelist={['*']} source={{ html: `<meta name="viewport" content="width=device-width, initial-scale=1">${html}` }} />
				) : error && !fetching ? (
					<View style={s.center}>
						<KText v="small" style={{ color: '#333' }} center>
							We couldn’t load the agreement.
						</KText>
						<Button title="Try again" variant="solid" size="sm" onPress={() => retry({ requestPolicy: 'network-only' })} />
					</View>
				) : (
					<Skeleton style={{ flex: 1, borderRadius: 0, backgroundColor: '#eee' }} />
				)}
			</View>
		</Sheet>
	);
}

// ── Cancel ─────────────────────────────────────────────────────

/** What cancelling costs, before we send the confirmation code. */
export function CancelSheet({ open, onClose, booking, onContinue, busy }: { open: boolean; onClose: () => void; booking: TripBooking; onContinue: () => void; busy?: boolean }) {
	const r = cancelRefund(booking);
	return (
		<Sheet open={open} onClose={onClose} title="Cancel this booking?" eyebrow="Before you decide">
			<KText v="small">You can cancel until the booking completes — when you confirm the handover, or {GRACE_DAYS} days after paying. Here’s what you’d get back:</KText>
			<Card>
				<KV k="Refund to your card" v={naira(r.refund)} strong />
				<Divider />
				{r.kept.platform > 0 ? <KV k="Kushi platform fee (not refundable)" v={`− ${naira(r.kept.platform)}`} /> : null}
				{r.kept.fee > 0 ? <KV k="Cancellation fee (10% of rent)" v={`− ${naira(r.kept.fee)}`} /> : null}
				{r.kept.custody > 0 ? <KV k="Caution custody fee" v={`− ${naira(r.kept.custody)}`} /> : null}
			</Card>
			<KText v="xs">Everything else — 90% of the rent, service charge, legal fee, stamp duty and your caution deposit — comes back to the card you paid with within {REFUND_DAYS}. Part of the cancellation fee goes to the host for holding the home.</KText>
			<Button title="Email me a code to cancel" variant="danger" size="lg" block loading={busy} onPress={onContinue} testID="cancel-continue" />
			<Button title="Keep my booking" variant="quiet" block onPress={onClose} />
		</Sheet>
	);
}

// ── Review ─────────────────────────────────────────────────────

const CATS = [
	['cleanliness', 'Cleanliness'],
	['accuracy', 'Accuracy'],
	['communication', 'Communication'],
	['location', 'Location'],
	['checkIn', 'Move-in'],
	['value', 'Value']
] as const;

export function ReviewCard({ hostingId, existing, onSaved }: { hostingId: string; existing?: TripBooking['userReview']; onSaved?: () => void }) {
	const [scores, setScores] = useState<Record<string, number>>({});
	const [text, setText] = useState('');
	const [saved, setSaved] = useState(false);
	const [{ fetching }, save] = useCreateUpdateHostingReviewMutation();
	useEffect(() => {
		if (existing) {
			setScores(Object.fromEntries(CATS.map(([k]) => [k, Number(existing[k] ?? 0)])));
			setText(existing.description ?? '');
		}
	}, [existing]);
	const ok = CATS.every(([k]) => (scores[k] ?? 0) > 0);
	const had = !!existing || saved;
	return (
		<Card>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
				<Star size={17} color={color.amber} />
				<KText v="heading">{had ? 'Your review' : 'Review this home'}</KText>
			</View>
			<KText v="xs">Honest reviews keep Kushi trustworthy for the next renter.</KText>
			{CATS.map(([k, l]) => (
				<View key={k} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<KText v="small">{l}</KText>
					<View style={{ flexDirection: 'row', gap: 2 }}>
						{[1, 2, 3, 4, 5].map((n) => (
							<Pressable key={n} hitSlop={4} onPress={() => setScores((x) => ({ ...x, [k]: n }))} accessibilityRole="button" accessibilityLabel={`${l}: ${n} star${n === 1 ? '' : 's'}`} accessibilityState={{ selected: (scores[k] ?? 0) === n }} style={{ padding: 3 }}>
								<Star size={22} color={(scores[k] ?? 0) >= n ? color.amber : color.line2} fill={(scores[k] ?? 0) >= n ? color.amber : 'transparent'} />
							</Pressable>
						))}
					</View>
				</View>
			))}
			<TextInput value={text} onChangeText={setText} multiline placeholder="What should the next renter know?" placeholderTextColor={color.dim} style={s.textarea} accessibilityLabel="Your review" />
			<Button
				title={had ? 'Update review' : 'Post review'}
				variant="ghost"
				disabled={!ok}
				loading={fetching}
				onPress={async () => {
					const r = await save({ input: { hostingId, id: existing?.id, description: text.trim() || null, ...scores } });
					if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t save your review', text2: clean(r.error.message) });
					setSaved(true);
					onSaved?.();
					toast.show({ type: 'success', text2: 'Thanks — your review helps the next renter.' });
				}}
			/>
		</Card>
	);
}

// ── Old links → the canonical screens ──────────────────────────

function Holding({ failed, onRetry }: { failed?: boolean; onRetry?: () => void }) {
	return (
		<View style={[s.full, { padding: 24 }]}>
			{failed ? (
				<Empty eyebrow="Off the map" title="We couldn’t open that" body="Check your connection and try again, or find it under Homes." action="Try again" onAction={onRetry} />
			) : (
				<Spinner size="large" />
			)}
			{failed ? <Button title="Go to Homes" variant="ghost" onPress={() => router.replace('/trips')} /> : null}
		</View>
	);
}

/** /bookings/:id and /trips/booking/:id — guests go to their trip, hosts to the application. */
export function BookingRedirect({ id }: { id?: string }) {
	const me = useUserStore((st) => st.user.user?.id);
	const [{ data, error, fetching }, retry] = useQuery<{ booking: { id: string; guest: { user: { id: string } }; bookingApplication: { id: string } } | null }>({ query: BOOKING_ROUTE, variables: { id: String(id ?? '') }, pause: !id });
	const b = data?.booking;
	if (!id || !me) return <Redirect href="/trips" />;
	if (b) return <Redirect href={(b.guest.user.id === me ? `/trips/${b.bookingApplication.id}` : `/applications/${b.bookingApplication.id}`) as Href} />;
	if (data && !b) return <Redirect href="/trips" />;
	return <Holding failed={!!error && !fetching} onRetry={() => retry({ requestPolicy: 'network-only' })} />;
}

/** /users/booking-applications/:id — guests go to their trip, hosts to their review screen. */
export function ApplicationRedirect({ id }: { id?: string }) {
	const me = useUserStore((st) => st.user.user?.id);
	const [{ data, error, fetching }, retry] = useQuery<{ bookingApplication: { id: string; guest: { user: { id: string } }; hosting: { host?: { user: { id: string } } | null } } | null }>({ query: APPLICATION_ROUTE, variables: { id: String(id ?? '') }, pause: !id });
	const a = data?.bookingApplication;
	if (!id || !me) return <Redirect href="/trips" />;
	if (a) return <Redirect href={(a.hosting.host?.user.id === me && a.guest.user.id !== me ? `/applications/${a.id}` : `/trips/${a.id}`) as Href} />;
	if (data && !a) return <Redirect href="/trips" />;
	return <Holding failed={!!error && !fetching} onRetry={() => retry({ requestPolicy: 'network-only' })} />;
}

// ── Little bits ────────────────────────────────────────────────

/** "Arrange the handover" address block (shown once paid). */
export function AddressBlock({ hosting }: { hosting: TripBooking['hosting'] }) {
	const parts = [hosting.street, hosting.landmarks, hosting.city, hosting.state].filter(Boolean);
	if (!hosting.street && !hosting.landmarks) return null;
	return (
		<View style={s.address}>
			<Eyebrow>Address</Eyebrow>
			<KText v="small" selectable>
				{parts.join(', ')}
			</KText>
		</View>
	);
}

export function ErrorState({ title, body, onRetry }: { title: string; body?: string; onRetry: () => void }) {
	return (
		<View style={{ paddingTop: 24, gap: 12 }}>
			<Notice tone="danger" title={title}>
				{body ?? 'Check your connection and try again.'}
			</Notice>
			<Button title="Try again" variant="ghost" onPress={onRetry} />
		</View>
	);
}

const s = StyleSheet.create({
	doc: { height: Platform.OS === 'web' ? 520 : 540, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#fff' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
	full: { flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
	address: { gap: 6, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2 },
	textarea: { minHeight: 90, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg, color: color.fg, fontFamily: font.body, fontSize: 15, textAlignVertical: 'top' }
});
