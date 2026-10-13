/**
 * Caution deposit on mobile, matching Housing web (web-app lib/kushi/caution):
 * - GuestCaution (trip screen): host claims to accept (confirm first — it pays
 *   the host at once) or dispute (with a reason) within 7 days, the refund
 *   breakdown and status, and new bank details when the bank rejects one.
 * - HostCaution (application screen): claim from the deposit and follow each
 *   claim to "Paid to you".
 * Logic and wording live in lib/k/caution.ts.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useMutation, useQuery } from 'urql';
import { HandCoins, Landmark, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Eyebrow, KText, Pill, Sheet } from '@/components/k';
import { Field } from '@/components/k/form';
import { color, font, radius } from '@/lib/k/theme';
import { date, naira } from '@/lib/k/format';
import { toast } from '@/lib/hooks/use-toast';
import { useBanksQuery, useResolveBankAccountQuery } from '@/lib/services/graphql/generated';
import {
	ANSWER_DAYS,
	BOOKING_FOR_APPLICATION,
	CAUTION_FOR_BOOKING,
	MAKE_CLAIM,
	REQUEST_REFUND,
	RESPOND_TO_CLAIM,
	answerBy,
	breakdown,
	claimForGuest,
	claimForHost,
	num,
	refundForGuest,
	type Claim,
	type Refund
} from '@/lib/k/caution';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

function useCaution(bookingId: string | null) {
	const [{ data, fetching }, refetch] = useQuery<{ cautionClaimsForBooking: Claim[]; cautionRefundForBooking: Refund | null }>({
		query: CAUTION_FOR_BOOKING,
		variables: { bookingId: bookingId ?? '' },
		pause: !bookingId,
		requestPolicy: 'network-only'
	});
	return {
		claims: data?.cautionClaimsForBooking ?? [],
		refund: data?.cautionRefundForBooking ?? null,
		loaded: !!data && !fetching,
		reload: () => refetch({ requestPolicy: 'network-only' })
	};
}

// ── Guest ──────────────────────────────────────────────────────

export function GuestCaution({
	booking,
	tenancyOver
}: {
	booking: { id: string; cautionFee?: unknown; cautionCustodyFee?: unknown; expiryDate?: string | null };
	tenancyOver: boolean;
}) {
	const { claims, refund, loaded, reload } = useCaution(booking.id);
	const [, respond] = useMutation(RESPOND_TO_CLAIM);
	const sums = breakdown(booking.cautionFee, booking.cautionCustodyFee, claims);

	const [accepting, setAccepting] = useState<Claim | null>(null);
	const [disputing, setDisputing] = useState<Claim | null>(null);
	const [reason, setReason] = useState('');
	const [busy, setBusy] = useState(false);
	const [refundOpen, setRefundOpen] = useState(false);

	async function answer(c: Claim, approved: boolean) {
		setBusy(true);
		const r = await respond({ input: { claimId: c.id, approved, notes: approved ? null : reason.trim() } });
		setBusy(false);
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t send', text2: clean(r.error.message) });
		setAccepting(null);
		setDisputing(null);
		toast.show({
			type: 'success',
			text2: approved ? `Accepted — ${naira(num(c.amountRequested))} is on its way to your host.` : 'Dispute sent — Kushi will review it and contact you both.'
		});
		reload();
	}

	return (
		<Card>
			<View style={st.head}>
				<ShieldCheck size={17} color={color.amber} />
				<KText v="heading">Caution deposit · {naira(sums.held)}</KText>
			</View>
			<KText v="xs">Held by Kushi, not the host. It comes back to you after your tenancy, minus Kushi’s custody fee and any claims you accept or Kushi approves.</KText>

			{claims.map((c) => {
				const s = claimForGuest(c);
				const pending = c.status === 'PENDING_GUEST_RESPONSE';
				return (
					<View key={c.id} style={st.claim}>
						<View style={st.top}>
							<KText v="smallStrong">Host claim · {naira(num(c.amountRequested))}</KText>
							<Pill tone={s.tone}>{s.label}</Pill>
						</View>
						{c.hostNotes ? <KText v="small">“{c.hostNotes}”</KText> : null}
						{pending ? (
							<>
								<KText v="small">
									Answer by <KText v="smallStrong">{date(answerBy(c.createdAt).toISOString())}</KText>. If you don’t, Kushi reviews it and decides.
								</KText>
								<View style={st.row}>
									<Button title="Accept" size="sm" variant="ghost" onPress={() => setAccepting(c)} />
									<Button
										title="Dispute"
										size="sm"
										variant="quiet"
										onPress={() => {
											setReason('');
											setDisputing(c);
										}}
									/>
								</View>
							</>
						) : (
							<>
								{s.detail ? <KText v="xs">{s.detail}</KText> : null}
								{c.adminNotes ? <KText v="xs">Kushi’s note: {c.adminNotes}</KText> : null}
							</>
						)}
						<KText v="xs">Filed {date(c.createdAt)}</KText>
					</View>
				);
			})}

			{loaded && (sums.custody > 0 || sums.approved > 0 || refund) ? (
				<View style={st.sum}>
					<Line k="Deposit" v={naira(sums.held)} />
					{sums.custody > 0 ? <Line k="Kushi custody fee" v={`− ${naira(sums.custody)}`} /> : null}
					{sums.approved > 0 ? <Line k="Claims paid to your host" v={`− ${naira(sums.approved)}`} /> : null}
					<View style={st.tot}>
						<Line strong k={refund?.status === 'COMPLETED' ? 'Refunded to you' : 'Comes back to you'} v={naira(refund && refund.status !== 'BLOCKED' ? num(refund.amount) : sums.refundable)} />
					</View>
					{sums.open > 0 ? <KText v="xs">{naira(sums.open)} in claims is still being decided.</KText> : null}
				</View>
			) : null}

			{refund ? (
				<View style={st.claim}>
					<View style={st.top}>
						<KText v="smallStrong">Your refund · {naira(num(refund.amount))}</KText>
						<Pill tone={refundForGuest(refund).tone}>{refundForGuest(refund).label}</Pill>
					</View>
					<KText v="xs">
						To {refund.accountName} · {refund.bankName} ····{refund.accountNumber?.slice(-4)}
					</KText>
					{refund.status === 'BLOCKED' && refund.blockedReason ? <KText v="small">{refund.blockedReason}</KText> : null}
					{refund.status === 'REQUESTED' ? <KText v="xs">Kushi checks every refund before sending it. We’ll tell you when it’s on its way.</KText> : null}
					{refund.status === 'FAILED' ? (
						<>
							<KText v="small">Your bank wouldn’t accept a transfer to this account. Send the details of another account in your name.</KText>
							<Button title="Send new details" size="sm" icon={<Landmark size={16} color={color.onAmber} />} onPress={() => setRefundOpen(true)} />
						</>
					) : null}
				</View>
			) : tenancyOver ? (
				<Button title="Request my refund" variant="ghost" icon={<Landmark size={16} color={color.fg} />} onPress={() => setRefundOpen(true)} />
			) : (
				<KText v="small">You can request your refund after {date(booking.expiryDate)}.</KText>
			)}

			<Sheet open={!!accepting} onClose={() => setAccepting(null)} title={accepting ? `Accept the host’s claim of ${naira(num(accepting.amountRequested))}?` : ''}>
				<KText v="small">{accepting ? naira(num(accepting.amountRequested)) : ''} is paid to your host from your caution deposit straight away. This can’t be undone.</KText>
				<Button title={accepting ? `Accept and pay ${naira(num(accepting.amountRequested))}` : 'Accept'} size="lg" block loading={busy} onPress={() => accepting && answer(accepting, true)} />
			</Sheet>

			<Sheet open={!!disputing} onClose={() => setDisputing(null)} title="Dispute this claim">
				<KText v="small">
					Tell Kushi why you disagree with the host’s claim of {disputing ? naira(num(disputing.amountRequested)) : ''}. Kushi reads both sides, may ask for photos, and decides. Nothing is paid while it’s being reviewed.
				</KText>
				<Field label="Why you dispute it" multiline value={reason} onChangeText={setReason} placeholder="e.g. The crack in the wall was there when I moved in." />
				<Button title="Send dispute to Kushi" size="lg" block disabled={!reason.trim()} loading={busy} onPress={() => disputing && answer(disputing, false)} />
			</Sheet>

			<RefundSheet open={refundOpen} resend={refund?.status === 'FAILED'} onClose={() => setRefundOpen(false)} bookingId={booking.id} onDone={reload} />
		</Card>
	);
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
	return (
		<View style={st.line}>
			<KText v={strong ? 'smallStrong' : 'small'} c={strong ? 'fg' : 'fg2'}>
				{k}
			</KText>
			<KText v={strong ? 'smallStrong' : 'small'}>{v}</KText>
		</View>
	);
}

function RefundSheet({ open, resend, onClose, bookingId, onDone }: { open: boolean; resend: boolean; onClose: () => void; bookingId: string; onDone: () => void }) {
	const [{ data }] = useBanksQuery({ pause: !open });
	const [q, setQ] = useState('');
	const [bank, setBank] = useState<{ name: string; code: string } | null>(null);
	const [acct, setAcct] = useState('');
	const ready = !!bank && acct.length === 10;
	const [{ data: rd, fetching: resolving }] = useResolveBankAccountQuery({ variables: { input: { accountNumber: acct, bankCode: bank?.code ?? '' } }, pause: !ready });
	const name = ready ? rd?.resolveBankAccount : null;
	const [{ fetching }, request] = useMutation(REQUEST_REFUND);
	const banks = useMemo(() => {
		const uniq = [...new Map((data?.banks ?? []).filter((x) => x.active !== false).map((x) => [x.code, x])).values()];
		const t = q.trim().toLowerCase();
		return uniq.filter((x) => !t || x.name.toLowerCase().includes(t)).sort((x, y) => x.name.localeCompare(y.name));
	}, [data, q]);
	return (
		<Sheet open={open} onClose={onClose} title={resend ? 'Send new account details' : 'Request your refund'} scroll={false}>
			{!bank ? (
				<>
					<TextInput value={q} onChangeText={setQ} placeholder="Search your bank" placeholderTextColor={color.dim} style={st.input} />
					<FlatList
						data={banks}
						style={{ maxHeight: 360 }}
						keyExtractor={(x) => x.code}
						renderItem={({ item }) => (
							<Pressable onPress={() => setBank(item)} style={st.bank}>
								<KText v="body">{item.name}</KText>
							</Pressable>
						)}
					/>
				</>
			) : (
				<View style={{ gap: 14 }}>
					<Pressable onPress={() => setBank(null)}>
						<KText v="label">Bank</KText>
						<KText v="bodyStrong">{bank.name} · change</KText>
					</Pressable>
					<TextInput
						value={acct}
						onChangeText={(t) => setAcct(t.replace(/\D/g, '').slice(0, 10))}
						keyboardType="number-pad"
						placeholder="10-digit account number"
						placeholderTextColor={color.dim}
						style={[st.input, { fontFamily: font.mono }]}
					/>
					{ready ? (
						<KText v="small" c={name ? 'success' : 'muted'}>
							{resolving ? 'Checking account…' : name ? `Account name: ${name}` : 'We couldn’t verify that account.'}
						</KText>
					) : null}
					<Eyebrow>The account must be in your name; we check it with your bank first.</Eyebrow>
					<Button
						title={resend ? 'Send new details' : 'Request refund'}
						size="lg"
						block
						disabled={!name}
						loading={fetching}
						onPress={async () => {
							const r = await request({ input: { bookingId, accountName: name!, accountNumber: acct, bankCode: bank.code, bankName: bank.name } });
							if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t send', text2: clean(r.error.message) });
							toast.show({ type: 'success', text2: resend ? 'New details sent — Kushi will check them and resend.' : 'Refund requested — Kushi will check it and send it to your account.' });
							onClose();
							onDone();
						}}
					/>
				</View>
			)}
		</Sheet>
	);
}

// ── Host ───────────────────────────────────────────────────────

type HostBooking = { id: string; paymentStatus?: string | null; cautionFee?: unknown; cautionCustodyFee?: unknown };

export function HostCaution({ applicationId, guestName }: { applicationId: string; guestName: string }) {
	const [{ data: ad }] = useQuery<{ bookingApplication: { booking: HostBooking | null } | null }>({
		query: BOOKING_FOR_APPLICATION,
		variables: { id: applicationId },
		requestPolicy: 'network-only'
	});
	const booking = ad?.bookingApplication?.booking ?? null;
	const live = !!booking && booking.paymentStatus === 'PAID' && num(booking.cautionFee as number) > 0;
	const { claims, refund, reload } = useCaution(live ? booking!.id : null);
	const [, make] = useMutation(MAKE_CLAIM);
	const [open, setOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [amount, setAmount] = useState('');
	const [reason, setReason] = useState('');
	const [sending, setSending] = useState(false);

	if (!live || !booking) return null;
	const first = guestName.split(' ')[0] || 'The guest';
	const sums = breakdown(booking.cautionFee, booking.cautionCustodyFee, claims);
	const available = Math.max(0, sums.held - sums.custody - sums.approved - sums.open);
	const refunded = refund?.status === 'PROCESSING' || refund?.status === 'COMPLETED';
	const value = Number(amount) || 0;
	const tooMuch = value > available;

	async function send() {
		setSending(true);
		const r = await make({ input: { bookingId: booking!.id, amount: String(value), notes: reason.trim() } });
		setSending(false);
		setConfirming(false);
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t send', text2: clean(r.error.message) });
		setOpen(false);
		setAmount('');
		setReason('');
		toast.show({ type: 'success', text2: `Claim sent — ${first} has ${ANSWER_DAYS} days to answer.` });
		reload();
	}

	return (
		<Card>
			<View style={st.head}>
				<ShieldCheck size={17} color={color.amber} />
				<KText v="heading">Caution deposit</KText>
			</View>
			<KText v="small">
				Kushi holds {naira(sums.held)} from {first}. If the home needs repairs or bills were left unpaid, you can claim from it; {first} gets the rest back after the tenancy.
			</KText>
			{claims.map((c) => {
				const s = claimForHost(c);
				return (
					<View key={c.id} style={st.claim}>
						<View style={st.top}>
							<KText v="smallStrong">Your claim · {naira(num(c.amountRequested))}</KText>
							<Pill tone={s.tone}>{s.label}</Pill>
						</View>
						{c.hostNotes ? <KText v="small">“{c.hostNotes}”</KText> : null}
						{s.detail ? <KText v="xs">{s.detail}</KText> : null}
						{c.guestResponseNotes && c.status !== 'PENDING_GUEST_RESPONSE' && !c.escalatedAt ? <KText v="xs">{first}: “{c.guestResponseNotes}”</KText> : null}
						{c.adminNotes ? <KText v="xs">Kushi’s note: {c.adminNotes}</KText> : null}
						<KText v="xs">Filed {date(c.createdAt)}</KText>
					</View>
				);
			})}
			{refunded ? (
				<KText v="small">{first}’s refund has been sent, so the deposit is closed.</KText>
			) : available > 0 ? (
				<>
					<Button title="Claim from the deposit" variant="ghost" icon={<HandCoins size={16} color={color.fg} />} onPress={() => setOpen(true)} />
					<KText v="xs">Up to {naira(available)} available. Payouts go to this listing’s payout account.</KText>
				</>
			) : (
				<KText v="small">Nothing left to claim: the deposit after Kushi’s fee is covered by your claims.</KText>
			)}

			<Sheet open={open && !confirming} onClose={() => setOpen(false)} title="Claim from the caution deposit">
				<KText v="small">
					Say what it’s for and how much. {first} has {ANSWER_DAYS} days to accept or dispute; Kushi decides disputes. Photos or receipts help: send them to {first} or Kushi support in Messages.
				</KText>
				<Field
					label="Amount (₦)"
					value={amount}
					onChangeText={(t) => setAmount(t.replace(/[^\d.]/g, ''))}
					keyboardType="decimal-pad"
					placeholder="e.g. 45000"
					hint={tooMuch ? undefined : `Up to ${naira(available)}`}
					error={tooMuch ? `You can claim up to ${naira(available)}.` : undefined}
				/>
				<Field label="What it’s for" multiline value={reason} onChangeText={setReason} placeholder="e.g. Broken bedroom door (₦30,000 repair) and an unpaid electricity bill (₦15,000)." />
				<Button title={`Send claim for ${value > 0 ? naira(value) : '…'}`} size="lg" block disabled={value <= 0 || tooMuch || !reason.trim()} onPress={() => setConfirming(true)} />
			</Sheet>

			<Sheet open={confirming} onClose={() => setConfirming(false)} title={`Claim ${naira(value)} from the deposit?`}>
				<KText v="small">
					{first} is asked to accept or dispute within {ANSWER_DAYS} days. If they accept, {naira(value)} is paid to your payout account straight away; if they dispute or don’t answer, Kushi reviews it.
				</KText>
				<Button title="Send claim" size="lg" block loading={sending} onPress={send} />
			</Sheet>
		</Card>
	);
}

const st = StyleSheet.create({
	head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
	row: { flexDirection: 'row', gap: 8 },
	claim: { gap: 6, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2 },
	sum: { gap: 6, padding: 12, borderRadius: radius.md, backgroundColor: color.surface },
	line: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
	tot: { paddingTop: 8, borderTopWidth: 1, borderTopColor: color.line2 },
	input: { height: 50, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg, color: color.fg, fontFamily: font.body, fontSize: 16 },
	bank: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.line }
});
