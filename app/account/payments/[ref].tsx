import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Copy, Headset, Share2 } from 'lucide-react-native';
import { Button, Card, Divider, Empty, Eyebrow, Header, IconButton, KText, KV, Photo, Pill, Screen, Skeleton, Waypoint } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { MoneyBanner } from '@/components/k/settings';
import { color, font } from '@/lib/k/theme';
import { naira, place } from '@/lib/k/format';
import { cleanError, fullDate, moneyState, shortDate, txKind, useReceipt, type MoneyState, type Receipt } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { SupportItemType, useInitiateSupportChatMutation } from '@/lib/services/graphql/generated';

/** One receipt: amount, where the money is now, what it paid for, and help. */
export default function ReceiptScreen() {
	const { ref } = useLocalSearchParams<{ ref: string }>();
	const [{ data, fetching, error }, refetch] = useReceipt(String(ref ?? ''));
	const [{ fetching: starting }, startChat] = useInitiateSupportChatMutation();
	const [sharing, setSharing] = useState(false);
	const t = data?.transactionByReference;

	async function help() {
		if (!t) return;
		const r = await startChat({ itemType: SupportItemType.Transaction, itemId: t.id });
		const id = r.data?.initiateSupportChat?.id;
		if (id) router.push(`/support/${id}`);
		else toast.show({ type: 'error', text1: 'Couldn’t reach support', text2: cleanError(r.error?.message) });
	}

	async function share() {
		if (!t) return;
		setSharing(true);
		try {
			const { uri } = await Print.printToFileAsync({ html: receiptHtml(t, moneyState(t)) });
			if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share receipt', UTI: 'com.adobe.pdf' });
		} catch {
			toast.show({ type: 'error', text1: 'Couldn’t make the PDF', text2: 'Try again in a moment.' });
		} finally {
			setSharing(false);
		}
	}

	const header = (
		<Header
			eyebrow="Payments"
			title="Receipt"
			right={
				t ? (
					<IconButton label="Share receipt as PDF" onPress={share} disabled={sharing}>
						<Share2 size={17} color={color.fg} />
					</IconButton>
				) : undefined
			}
		/>
	);

	if (!t)
		return (
			<Screen header={header}>
				{fetching ? (
					<View style={{ gap: 14, paddingTop: 20 }}>
						<Skeleton style={{ height: 150 }} />
						<Skeleton style={{ height: 110 }} />
						<Skeleton style={{ height: 220 }} />
					</View>
				) : (
					<Empty
						eyebrow={error ? 'Couldn’t load' : 'Not found'}
						title={error ? 'We couldn’t open this receipt' : 'No receipt with that reference'}
						body={error ? cleanError(error.message) || 'Check your connection and try again.' : 'It may belong to another account. Your payments list has every receipt that’s yours.'}
						action={error ? 'Try again' : 'See my payments'}
						onAction={() => (error ? refetch({ requestPolicy: 'network-only' }) : router.replace('/account/payments'))}
					/>
				)}
			</Screen>
		);

	const kind = txKind(t.type);
	const state = moneyState(t);
	const b = t.booking;
	const fees = (b?.feeLineItems ?? []).filter((f) => Number(f.amount) > 0);
	const isRent = t.type === 'booking_payment';

	return (
		<Screen header={header} onRefresh={() => refetch({ requestPolicy: 'network-only' })} refreshing={false}>
			<View style={{ alignItems: 'center', gap: 10, paddingTop: 24 }}>
				<Eyebrow>{kind.label}</Eyebrow>
				<KText v="hero" style={{ fontSize: 38 }} adjustsFontSizeToFit numberOfLines={1} accessibilityLabel={`${kind.incoming ? 'Received' : 'Paid'} ${naira(Number(t.amount))}`}>
					{naira(Number(t.amount))}
				</KText>
				<Pill tone={state.tone}>{state.label}</Pill>
				<KText v="xs">{fullDate(t.createdAt)}</KText>
			</View>

			<MoneyBanner state={state} />

			{isRent && (state.key === 'escrow' || state.key === 'released') ? <EscrowTrail t={t} state={state} /> : null}

			{b?.hosting ? (
				<Card onPress={isRent || t.type === 'guest_cancellation_refund' ? () => router.push(`/trips/booking/${b.id}`) : undefined}>
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
						<Photo uri={b.hosting.coverImage?.asset?.publicUrl} w={160} h={160} style={{ width: 56, height: 56 }} />
						<View style={{ flex: 1, gap: 2 }}>
							<KText v="xs">Payment for</KText>
							<KText v="bodyStrong" numberOfLines={2}>
								{b.hosting.title ?? 'Your home'}
							</KText>
							<KText v="xs">{[place(b.hosting.city, b.hosting.state), b.durationDescription].filter(Boolean).join(' · ')}</KText>
						</View>
					</View>
				</Card>
			) : null}

			{isRent && fees.length ? (
				<Card>
					<KText v="heading">What you paid for</KText>
					{fees.map((f) => (
						<KV key={f.key} k={f.label} v={naira(Number(f.amount))} />
					))}
					<Divider />
					<KV k="Total" v={naira(Number(b?.amount ?? t.amount))} strong />
					{Number(b?.cautionFee ?? 0) > 0 ? <KText v="xs">The caution deposit stays with Kushi until you move out, then comes back to you minus any agreed claims.</KText> : null}
				</Card>
			) : null}

			{t.type === 'host_booking_payment' && t.disbursementAmount != null ? (
				<Card>
					<KText v="heading">Payout</KText>
					<KV k="Released from escrow" v={naira(Number(t.amount))} />
					{Number(t.transferFee ?? 0) > 0 ? <KV k="Bank transfer fee" v={`−${naira(Number(t.transferFee))}`} /> : null}
					<Divider />
					<KV k="Sent to your account" v={naira(Number(t.disbursementAmount))} strong />
				</Card>
			) : null}

			<Card>
				<KText v="heading">Details</KText>
				<RefLine label="Reference" value={t.reference ?? t.id} />
				{b?.bookingReference ? <RefLine label="Booking reference" value={b.bookingReference} /> : null}
				<KV k="Date" v={fullDate(t.createdAt)} />
				{t.lastUpdated && t.lastUpdated !== t.createdAt ? <KV k="Last update" v={fullDate(t.lastUpdated)} /> : null}
				<KV k="Type" v={kind.label} />
			</Card>

			<Card>
				<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
					<Headset size={20} color={color.amber} />
					<View style={{ flex: 1, gap: 2 }}>
						<KText v="bodyStrong">Something wrong with this payment?</KText>
						<KText v="xs">Our team sees this receipt when you message from here.</KText>
					</View>
				</View>
				<Button title="Get help with this payment" variant="ghost" loading={starting} onPress={help} testID="receipt-help" />
			</Card>
			<Button title="Share receipt (PDF)" variant="quiet" loading={sharing} onPress={share} icon={<Share2 size={16} color={color.fg2} />} />
		</Screen>
	);
}

/** Paid → in escrow → released, with dates. */
function EscrowTrail({ t, state }: { t: Receipt; state: MoneyState }) {
	const released = state.key === 'released';
	const due = t.booking?.autoFinalizeAt;
	const steps = [
		{ title: 'You paid', when: shortDate(t.createdAt), done: true },
		{ title: 'Kushi holds it in escrow', when: released ? 'Done' : 'Now', done: released, active: !released },
		{ title: 'Released to the host', when: released ? shortDate(t.booking?.hostTransaction?.createdAt) : due ? `By ${shortDate(due)} at the latest` : 'After you confirm your move-in', done: released }
	];
	return (
		<Card>
			{steps.map((s, i) => (
				<View key={s.title} style={{ flexDirection: 'row', gap: 12 }}>
					<View style={{ alignItems: 'center', width: 14, paddingTop: 5 }}>
						<Waypoint done={s.done} active={s.active} />
						{i < steps.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: s.done ? color.amberLine : color.line2, marginTop: 4, minHeight: 18 }} /> : null}
					</View>
					<View style={{ flex: 1, gap: 2, paddingBottom: i < steps.length - 1 ? 10 : 0 }}>
						<KText v="smallStrong" c={s.done || s.active ? 'fg' : 'muted'}>
							{s.title}
						</KText>
						<KText v="xs">{s.when}</KText>
					</View>
				</View>
			))}
		</Card>
	);
}

function RefLine({ label, value }: { label: string; value: string }) {
	return (
		<View style={{ gap: 4 }}>
			<KText v="small">{label}</KText>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Copy ${label.toLowerCase()} ${value}`}
				onPress={async () => {
					await Clipboard.setStringAsync(value);
					toast.show({ type: 'success', text2: `${label} copied` });
				}}
				style={({ pressed }) => [s.ref, pressed && { opacity: 0.7 }]}
			>
				<KText style={{ fontFamily: font.mono, fontSize: 13, color: color.fg, flex: 1 }} selectable>
					{value}
				</KText>
				<Copy size={15} color={color.muted} />
			</Pressable>
		</View>
	);
}

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

function receiptHtml(t: Receipt, st: MoneyState) {
	const kind = txKind(t.type);
	const rows: [string, string][] = [
		['Amount', naira(Number(t.amount))],
		['Status', st.label],
		['Type', kind.label],
		['Date', fullDate(t.createdAt)],
		['Reference', t.reference ?? t.id]
	];
	if (t.booking?.bookingReference) rows.push(['Booking reference', t.booking.bookingReference]);
	if (t.booking?.hosting?.title) rows.push(['Home', t.booking.hosting.title]);
	const fees = (t.booking?.feeLineItems ?? []).filter((f) => Number(f.amount) > 0);
	return `<html><head><meta charset="utf-8"/><style>
body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111;padding:40px}
h1{font-size:20px;margin:0 0 4px}.muted{color:#666;font-size:12px}
.amt{font-size:34px;font-weight:700;margin:24px 0 4px}
table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:9px 0;border-bottom:1px solid #eee;font-size:13px}
td:last-child{text-align:right;font-weight:600}.note{margin-top:20px;font-size:12px;color:#444;border-left:3px solid #F59E0B;padding-left:10px}
</style></head><body>
<h1>Kushi Housing — receipt</h1><div class="muted">kushi.ng · support@kushi.ng</div>
<div class="amt">${esc(naira(Number(t.amount)))}</div><div class="muted">${esc(kind.label)} · ${esc(st.label)}</div>
<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
${fees.length ? `<table>${fees.map((f) => `<tr><td>${esc(f.label)}</td><td>${esc(naira(Number(f.amount)))}</td></tr>`).join('')}</table>` : ''}
<p class="note">${esc(st.body)}</p>
</body></html>`;
}

const s = StyleSheet.create({
	ref: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg }
});
