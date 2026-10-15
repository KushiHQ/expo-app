/**
 * The host's single review screen for an application: who is applying, how much
 * Kushi has verified, the stay they want, then the decision. After accepting it
 * becomes the tenancy view: payment, escrow, payout, caution deposit, agreement.
 * Used full-screen (/applications/[id]) and as the detail pane on tablets.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'urql';
import { BadgeCheck, CircleDashed, Check as CheckIcon, MessageCircle, X } from 'lucide-react-native';
import { Agreement } from './agreement';
import { HostCaution } from './caution';
import { APP_STATUS, DECIDABLE } from './host-bits';
import { Button } from './button';
import { Card, Chip, Avatar, Pill, Photo, Skeleton, Waypoint, Divider } from './surface';
import { KText } from './text';
import { Header, Screen } from './layout';
import { KV, Notice } from './feedback';
import { Check } from './form';
import { OtpSheet, Sheet } from './sheet';
import { color, font, gutter, radius } from '@/lib/k/theme';
import { date, duration, humanize, naira, place, relative } from '@/lib/k/format';
import { DECLINE_REASONS, PAYOUT, tenancyEnd, tenancyStage, trustChecks, trustLevel, type TenancyBooking } from '@/lib/k/manage';
import { employmentStatusLabel, guarantorRelationshipLabel } from '@/lib/k/agreement/reservation';
import { toast } from '@/lib/hooks/use-toast';
import { K_APPLICANT_TRUST, K_HOST_TENANCY } from '@/lib/services/graphql/requests/queries/k-manage';
import {
	BookingApplicationStatus,
	useAcceptBookingApplicationMutation,
	useCreateUpdateMessageMutation,
	useHostUpdateBookingApplicationStatusMutation,
	useHostingQuery,
	useInitiateAcceptBookingApplicationMutation,
	useInitiateHostingChatWithGuestMutation,
	useKBookingApplicationQuery
} from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');
const INCOME: Record<string, string> = { LOW: '₦100k – ₦200k / month', MID: '₦200k – ₦1m / month', HIGH: '₦1m – ₦5m / month', VIP: 'Above ₦5m / month' };
const OCC: Record<string, string> = { SINGLE: 'Just them', COUPLE: 'A couple', SMALL_FAMILY: 'Small family (up to 4)', LARGE_FAMILY: 'Large family (5+)' };

type TrustData = {
	bookingApplication: {
		id: string;
		guest: { id: string; signature?: { id: string } | null; user: { id: string; phoneNumberVerified?: boolean | null; createdAt?: string | null; kyc?: { id: string; ninVerified?: boolean | null; bvnVerified?: boolean | null; idDocumentType?: string | null } | null } };
	} | null;
};
type TenancyData = { bookingApplication: { id: string; booking?: TenancyBooking | null } | null };

export function ApplicationReview({ id, embedded, onChanged }: { id: string; embedded?: boolean; onChanged?: () => void }) {
	const [{ data, fetching, error }, refetch] = useKBookingApplicationQuery({ variables: { bookingApplicationId: id }, requestPolicy: 'cache-and-network' });
	const a = data?.bookingApplication;
	const [{ data: hd }] = useHostingQuery({ variables: { hostingId: a?.hosting.id ?? '', pagination: { limit: 1, offset: 0 } }, pause: !a });
	const h = hd?.hosting;
	const [{ data: td }] = useQuery<TrustData>({ query: K_APPLICANT_TRUST, variables: { bookingApplicationId: id }, requestPolicy: 'cache-and-network' });
	const accepted = a?.status === 'ACCEPTED';
	const [{ data: bd }, refetchTenancy] = useQuery<TenancyData>({ query: K_HOST_TENANCY, variables: { bookingApplicationId: id }, pause: !accepted, requestPolicy: 'cache-and-network' });
	const [{ fetching: starting }, initAccept] = useInitiateAcceptBookingApplicationMutation();
	const [, accept] = useAcceptBookingApplicationMutation();
	const [{ fetching: declining }, setStatus] = useHostUpdateBookingApplicationStatusMutation();
	const [{ fetching: opening }, chat] = useInitiateHostingChatWithGuestMutation();
	const [, sendMessage] = useCreateUpdateMessageMutation();
	const [otp, setOtp] = useState(false);
	const [confirmAccept, setConfirmAccept] = useState(false);
	const [declineOpen, setDeclineOpen] = useState(false);
	const [reason, setReason] = useState<string | null>(null);
	const [note, setNote] = useState('');
	const [tell, setTell] = useState(true);
	const [agreementOpen, setAgreementOpen] = useState(false);

	const reload = () => {
		refetch({ requestPolicy: 'network-only' });
		refetchTenancy({ requestPolicy: 'network-only' });
		onChanged?.();
	};

	if (!a) {
		const body = fetching ? (
			<View style={{ gap: 14, paddingTop: 20 }}>
				<View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
					<Skeleton style={{ width: 72, height: 72, borderRadius: 36 }} />
					<View style={{ flex: 1, gap: 8 }}>
						<Skeleton style={{ height: 18, width: '40%' }} />
						<Skeleton style={{ height: 24, width: '70%' }} />
					</View>
				</View>
				<Skeleton style={{ height: 150 }} />
				<Skeleton style={{ height: 150 }} />
			</View>
		) : error ? (
			<View style={{ paddingTop: 20 }}>
				<Notice tone="danger" title="Couldn’t load this application" action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })}>
					{clean(error.message) || 'Check your connection and try again.'}
				</Notice>
			</View>
		) : (
			<View style={{ paddingTop: 20 }}>
				<Notice tone="warn" title="Application not found">
					It may have been withdrawn, or it belongs to another host account.
				</Notice>
			</View>
		);
		return embedded ? (
			<View style={{ flex: 1, paddingHorizontal: gutter }}>{body}</View>
		) : (
			<Screen header={<Header title="Application" />}>{body}</Screen>
		);
	}

	const g = a.guestFormData;
	const first = a.fullName?.split(' ')[0] || 'them';
	const trust = td?.bookingApplication?.guest;
	const checks = trustChecks({
		nin: trust?.user.kyc?.ninVerified ?? a.guest?.user?.kyc?.ninVerified,
		bvn: trust?.user.kyc?.bvnVerified ?? a.guest?.user?.kyc?.bvnVerified,
		phone: trust?.user.phoneNumberVerified,
		signed: !!trust?.signature?.id || !!a.bookingAggrement,
		guarantor: !!g?.guarantorRelationships
	});
	const level = trustLevel(checks);
	const canDecide = DECIDABLE.includes(a.status);
	const interval = a.hosting.paymentInterval ?? 'ANUALLY';
	const periods = a.intervalMultiplier ?? 1;
	const st = APP_STATUS[a.status] ?? { label: humanize(a.status), tone: 'neutral' as const };
	const ends = tenancyEnd(a.commencementDate, periods, interval);
	const booking = bd?.bookingApplication?.booking ?? null;

	async function openChat(): Promise<string | null> {
		if (!a?.guest?.user?.id) return null;
		const r = await chat({ hostingId: a.hosting.id, guestUserId: a.guest.user.id });
		return r.data?.initiateHostingChatWithGuest?.id ?? null;
	}
	async function message() {
		const cid = await openChat();
		if (cid) router.push(`/chats/${cid}`);
		else toast.show({ type: 'error', text1: 'Couldn’t open chat', text2: 'Try again in a moment.' });
	}
	async function decline() {
		const r = await setStatus({ input: { bookingApplicationId: a!.id, status: BookingApplicationStatus.Rejected } });
		if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t decline', text2: clean(r.error.message) });
		const why = [reason, note.trim()].filter(Boolean).join('. ');
		if (tell && why) {
			const cid = await openChat();
			if (cid) await sendMessage({ input: { chatId: cid, text: `I’ve declined your application for ${a!.hosting.title}. ${why}` } });
		}
		setDeclineOpen(false);
		setReason(null);
		setNote('');
		toast.show({ type: 'success', text2: `Declined. ${first} has been told.` });
		reload();
	}

	const head = (
		<View style={{ gap: 16 }}>
			<View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingTop: 18 }}>
				<Avatar name={a.fullName} uri={a.guest?.user?.profile?.image?.publicUrl} size={72} />
				<View style={{ flex: 1, gap: 6 }}>
					<Pill tone={st.tone}>{st.label}</Pill>
					<KText v="title" accessibilityRole="header">
						{a.fullName}
					</KText>
					<KText v="xs">Applied {relative(a.createdAt)}</KText>
				</View>
			</View>
			<View style={s.listing}>
				<Photo assetId={a.hosting.coverImage?.asset?.id} w={200} h={160} style={{ width: 56, height: 46 }} />
				<View style={{ flex: 1, gap: 2 }}>
					<KText v="micro" c="amber">
						Applying for
					</KText>
					<KText v="smallStrong" numberOfLines={1}>
						{a.hosting.title}
					</KText>
					<KText v="xs" numberOfLines={1}>
						{place(a.hosting.city, a.hosting.state)}
					</KText>
				</View>
			</View>
			{canDecide ? (
				<Notice tone="warn" title="Waiting for your decision">
					{`Move in ${date(a.commencementDate)} for ${duration(periods, interval)}. Verification: ${level.label.toLowerCase()} (${level.score} of ${checks.length} checks).`}
				</Notice>
			) : a.status === 'REJECTED' || a.status === 'CANCELLED' ? (
				<Notice tone="info">{a.statusDetails ?? (a.status === 'REJECTED' ? 'You declined this application.' : `${first} withdrew this application.`)}</Notice>
			) : null}
		</View>
	);

	const body = (
		<>
			{head}
			{accepted ? <Tenancy booking={booking} first={first} /> : null}

			<Card>
				<View style={s.cardHead}>
					<KText v="heading">Verification</KText>
					<Pill tone={level.tone === 'warn' ? 'warn' : level.tone}>{level.label}</Pill>
				</View>
				{checks.map((c) => (
					<View key={c.key} style={s.check} accessibilityLabel={`${c.label}: ${c.ok ? 'verified' : 'not verified'}`}>
						{c.ok ? <BadgeCheck size={18} color={color.success} /> : <CircleDashed size={18} color={color.dim} />}
						<View style={{ flex: 1 }}>
							<KText v="smallStrong" style={!c.ok ? { color: color.fg2 } : undefined}>
								{c.label}
							</KText>
							<KText v="xs">{c.detail}</KText>
						</View>
					</View>
				))}
			</Card>

			<Card>
				<KText v="heading">The stay</KText>
				<KV k="Move in" v={date(a.commencementDate)} />
				{ends ? <KV k="Ends" v={date(ends)} /> : null}
				<KV k="Length" v={duration(periods, interval)} />
				<KV k="Rent" v={naira((a.hosting.price ?? 0) * periods)} />
				{h?.cautionFee ? <KV k="Caution deposit (held by Kushi)" v={naira(h.cautionFee)} /> : null}
			</Card>

			<Card>
				<KText v="heading">About {first}</KText>
				<KV k="Work" v={g ? employmentStatusLabel(g.employmentStatus) : '—'} />
				{g?.incomeRanges ? <KV k="Income" v={INCOME[g.incomeRanges] ?? humanize(g.incomeRanges)} /> : null}
				<KV k="Household" v={g?.occupancyTypes ? (OCC[g.occupancyTypes] ?? humanize(g.occupancyTypes)) : '—'} />
				<KV k="Lives at" v={a.correspondenceAddress ?? '—'} />
				<Divider />
				<KV k="Email" v={a.email ?? '—'} />
				<KV k="Phone" v={a.phoneNumber ?? '—'} />
				<KText v="xs">Keep conversations and payments on Kushi so we can help if something goes wrong.</KText>
			</Card>

			{g?.guarantorRelationships ? (
				<Card>
					<KText v="heading">Guarantor</KText>
					<KV k="Name" v={g.guarantorName ?? '—'} />
					<KV k="Relationship" v={guarantorRelationshipLabel(g.guarantorRelationships)} />
					{g.guarantorPhone ? <KV k="Phone" v={g.guarantorPhone} /> : null}
					{g.guarantorAddress ? <KV k="Address" v={g.guarantorAddress} /> : null}
				</Card>
			) : null}

			<Card>
				<KText v="heading">Documents</KText>
				<KText v="small">{accepted ? `The tenancy agreement ${first} signed is in force.` : `${first} has read and signed your tenancy agreement. It takes effect once you accept and they pay.`}</KText>
				<Button title="Read the signed agreement" variant="ghost" size="sm" onPress={() => setAgreementOpen(true)} testID="app-agreement" />
			</Card>

			{accepted ? <HostCaution applicationId={a.id} guestName={a.fullName ?? ''} /> : null}
		</>
	);

	const footer = (
		<View style={{ gap: 10 }}>
			{canDecide ? (
				<View style={{ flexDirection: 'row', gap: 10 }}>
					<Button title="Decline" variant="ghost" icon={<X size={16} color={color.fg} />} onPress={() => setDeclineOpen(true)} style={{ flex: 1 }} testID="app-decline" />
					<Button title={`Accept ${first}`} icon={<CheckIcon size={18} color={color.onAmber} />} onPress={() => setConfirmAccept(true)} style={{ flex: 1.4 }} testID="app-accept" />
				</View>
			) : null}
			<Button title={`Message ${first}`} variant={canDecide ? 'quiet' : 'ghost'} size={canDecide ? 'sm' : 'md'} icon={<MessageCircle size={16} color={color.fg} />} loading={opening} onPress={message} testID="app-message" />
		</View>
	);

	const sheets = (
		<>
			<Sheet open={confirmAccept} onClose={() => setConfirmAccept(false)} eyebrow="Accept" title={`Accept ${first}?`}>
				<KText v="small">{first} will be asked to pay into Kushi escrow. You get paid once they move in and confirm (or automatically after 14 days). Other pending applications for this home are declined automatically.</KText>
				<KText v="small">We’ll email you a 6-digit code to confirm.</KText>
				<Button
					title="Send me the code"
					size="lg"
					block
					loading={starting}
					onPress={async () => {
						const r = await initAccept({ applicationId: a.id });
						setConfirmAccept(false);
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t start', text2: clean(r.error.message) });
						setOtp(true);
					}}
				/>
			</Sheet>
			<Sheet open={declineOpen} onClose={() => setDeclineOpen(false)} eyebrow="Decline" title={`Decline ${first}?`}>
				<KText v="small">Pick a reason so {first} knows what happened. Declining can’t be undone; they can apply again.</KText>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
					{DECLINE_REASONS.map((r) => (
						<Chip key={r} label={r} on={reason === r} onPress={() => setReason(reason === r ? null : r)} />
					))}
				</View>
				<TextInput value={note} onChangeText={setNote} placeholder="Add a note (optional)" placeholderTextColor={color.dim} multiline style={s.note} accessibilityLabel="Note to the applicant" />
				<Check on={tell} onPress={() => setTell((v) => !v)}>
					<KText v="small">Send this to {first} in Messages</KText>
				</Check>
				<Button title="Decline application" variant="danger" size="lg" block loading={declining} onPress={decline} />
			</Sheet>
			<OtpSheet
				open={otp}
				onClose={() => setOtp(false)}
				title="Confirm acceptance"
				body="Enter the code we emailed you. Accepting creates the booking and asks the renter to pay into escrow."
				action="Accept application"
				onResend={async () => void (await initAccept({ applicationId: a.id }))}
				onSubmit={async (code) => {
					const r = await accept({ applicationId: a.id, otp: code });
					if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
					toast.show({ type: 'success', text2: `Accepted. We’ve asked ${first} to pay into escrow.` });
					reload();
					return null;
				}}
			/>
			<Sheet open={agreementOpen} onClose={() => setAgreementOpen(false)} title="Tenancy agreement">
				{h ? <Agreement agreement={a.bookingAggrement as never} hosting={h as never} application={a as never} /> : <Skeleton style={{ height: 200 }} />}
			</Sheet>
		</>
	);

	if (embedded)
		return (
			<View style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
					{body}
				</ScrollView>
				<View style={s.footer}>{footer}</View>
				{sheets}
			</View>
		);
	return (
		<Screen header={<Header eyebrow="Application" title={a.fullName ?? 'Applicant'} />} footer={footer}>
			{body}
			{sheets}
		</Screen>
	);
}

function Tenancy({ booking, first }: { booking: TenancyBooking | null; first: string }) {
	const stage = tenancyStage(booking);
	const steps: { key: string; label: string }[] = [
		{ key: 'accepted', label: 'You accepted' },
		{ key: 'paid', label: 'Paid into escrow' },
		{ key: 'released', label: 'Paid out to you' }
	];
	const at = steps.findIndex((x) => x.key === stage.step);
	const payout = booking?.hostTransaction ? (PAYOUT[booking.hostTransaction.status] ?? { label: humanize(booking.hostTransaction.status), tone: 'neutral' as const }) : null;
	const yourShare = booking?.amount != null ? Number(booking.amount) - Number(booking.hostServiceCharge ?? 0) : null;
	return (
		<Card tone={stage.tone === 'danger' ? 'danger' : 'amber'}>
			<View style={s.cardHead}>
				<KText v="heading">Tenancy</KText>
				<Pill tone={stage.tone}>{stage.label}</Pill>
			</View>
			{!stage.ended ? (
				<View style={{ gap: 10 }} accessibilityLabel={`Progress: ${stage.label}`}>
					{steps.map((x, i) => (
						<View key={x.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
							<Waypoint done={i < at || (i === at && stage.step === 'released')} active={i === at} />
							<KText v={i === at ? 'smallStrong' : 'small'} style={i > at ? { color: color.dim } : undefined}>
								{x.label}
							</KText>
						</View>
					))}
				</View>
			) : null}
			{stage.step === 'accepted' && !stage.ended ? (
				<KText v="small">
					{`We’ve asked ${first} to pay into Kushi escrow.`}
					{booking?.expiresAt ? ` The offer expires ${relative(booking.expiresAt)}.` : ''}
				</KText>
			) : null}
			{stage.step === 'paid' ? <KText v="small">{`Kushi is holding the payment. It’s released to you when ${first} confirms the move-in${booking?.autoFinalizeAt ? `, or automatically on ${date(booking.autoFinalizeAt)}` : ''}.`}</KText> : null}
			{booking ? (
				<View style={{ gap: 2 }}>
					{booking.commencementDate ? <KV k="Move in" v={date(booking.commencementDate)} /> : null}
					{booking.expiryDate ? <KV k="Tenancy ends" v={date(booking.expiryDate)} /> : null}
					{yourShare != null && booking.paymentStatus === 'PAID' ? <KV k="Your payout" v={naira(yourShare)} strong /> : null}
					{payout ? <KV k="Payout status" v={<Pill tone={payout.tone}>{payout.label}</Pill>} /> : null}
				</View>
			) : null}
		</Card>
	);
}

const s = StyleSheet.create({
	listing: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 },
	cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
	check: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
	note: { minHeight: 80, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg, color: color.fg, fontFamily: font.body, fontSize: 15, textAlignVertical: 'top' },
	footer: { paddingHorizontal: gutter, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, backgroundColor: color.bg }
});
