import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeCheck, Check, MessageCircle, ShieldAlert, Users, X } from 'lucide-react-native';
import { Agreement } from '@/components/k/agreement';
import { HostCaution } from '@/components/k/caution';
import { APP_STATUS, DECIDABLE } from '@/components/k/host-bits';
import { Avatar, Button, Card, Header, KText, KV, Notice, OtpSheet, Pill, Screen, Sheet, Skeleton } from '@/components/k';
import { color } from '@/lib/k/theme';
import { date, duration, humanize, naira, relative } from '@/lib/k/format';
import { employmentStatusLabel, guarantorRelationshipLabel } from '@/lib/k/agreement/reservation';
import { toast } from '@/lib/hooks/use-toast';
import {
	BookingApplicationStatus,
	useAcceptBookingApplicationMutation,
	useHostUpdateBookingApplicationStatusMutation,
	useHostingQuery,
	useInitiateAcceptBookingApplicationMutation,
	useInitiateHostingChatWithGuestMutation,
	useKBookingApplicationQuery
} from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');
const INCOME: Record<string, string> = { LOW: '₦100k – ₦200k / month', MID: '₦200k – ₦1m / month', HIGH: '₦1m – ₦5m / month', VIP: 'Above ₦5m / month' };
const OCC: Record<string, string> = { SINGLE: 'Just them', COUPLE: 'A couple', SMALL_FAMILY: 'Small family (up to 4)', LARGE_FAMILY: 'Large family (5+)' };

export default function Review() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();
	const [{ data, fetching }, refetch] = useKBookingApplicationQuery({ variables: { bookingApplicationId: id }, requestPolicy: 'cache-and-network' });
	const a = data?.bookingApplication;
	const [{ data: hd }] = useHostingQuery({ variables: { hostingId: a?.hosting.id ?? '', pagination: { limit: 1, offset: 0 } }, pause: !a });
	const h = hd?.hosting;
	const [{ fetching: starting }, initAccept] = useInitiateAcceptBookingApplicationMutation();
	const [, accept] = useAcceptBookingApplicationMutation();
	const [{ fetching: declining }, setStatus] = useHostUpdateBookingApplicationStatusMutation();
	const [{ fetching: opening }, chat] = useInitiateHostingChatWithGuestMutation();
	const [otp, setOtp] = useState(false);
	const [confirmAccept, setConfirmAccept] = useState(false);
	const [confirmDecline, setConfirmDecline] = useState(false);
	const [agreementOpen, setAgreementOpen] = useState(false);

	if (!a)
		return (
			<Screen header={<Header title="Application" />}>
				{fetching ? <Skeleton style={{ height: 200, marginTop: 20 }} /> : <Notice tone="danger">We couldn’t find that application.</Notice>}
			</Screen>
		);

	const g = a.guestFormData;
	const first = a.fullName?.split(' ')[0] ?? 'them';
	const verified = !!a.guest?.user?.kyc?.ninVerified;
	const canDecide = DECIDABLE.includes(a.status);
	const interval = a.hosting.paymentInterval ?? 'ANUALLY';
	const st = APP_STATUS[a.status] ?? { label: a.status, tone: 'neutral' as const };

	async function message() {
		if (!a?.guest?.user?.id) return;
		const r = await chat({ hostingId: a.hosting.id, guestUserId: a.guest.user.id });
		const cid = r.data?.initiateHostingChatWithGuest?.id;
		if (cid) router.push(`/chats/${cid}`);
		else toast.show({ type: 'error', text1: 'Couldn’t open chat', text2: clean(r.error?.message) });
	}

	return (
		<Screen header={<Header eyebrow="Application" title={a.fullName ?? 'Applicant'} />} footer={undefined}>
			<View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingTop: 18 }}>
				<Avatar name={a.fullName} uri={a.guest?.user?.profile?.image?.publicUrl} size={72} />
				<View style={{ flex: 1, gap: 6 }}>
					<Pill tone={st.tone}>{st.label}</Pill>
					<KText v="title">{a.fullName}</KText>
					<KText v="xs">
						wants {a.hosting.title} · applied {relative(a.createdAt)}
					</KText>
				</View>
			</View>
			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
				{verified ? <Badge ok icon={<BadgeCheck size={14} color={color.success} />} text="Identity verified (NIN)" /> : <Badge icon={<ShieldAlert size={14} color={color.amber} />} text="Identity not verified" />}
				{a.guest?.user?.kyc?.bvnVerified ? <Badge ok icon={<BadgeCheck size={14} color={color.success} />} text="BVN verified" /> : null}
				{g?.guarantorRelationships ? <Badge ok icon={<Users size={14} color={color.success} />} text="Has a guarantor" /> : null}
			</View>

			<Card>
				<KText v="heading">The stay</KText>
				<KV k="Move in" v={date(a.commencementDate)} />
				<KV k="Length" v={duration(a.intervalMultiplier ?? 1, interval)} />
				<KV k="Rent" v={naira((a.hosting.price ?? 0) * (a.intervalMultiplier ?? 1))} />
				{h?.cautionFee ? <KV k="Caution deposit (held by Kushi)" v={naira(h.cautionFee)} /> : null}
			</Card>
			<Card>
				<KText v="heading">About {first}</KText>
				<KV k="Work" v={g ? employmentStatusLabel(g.employmentStatus) : '—'} />
				{g?.incomeRanges ? <KV k="Income" v={INCOME[g.incomeRanges] ?? humanize(g.incomeRanges)} /> : null}
				<KV k="Household" v={g?.occupancyTypes ? (OCC[g.occupancyTypes] ?? humanize(g.occupancyTypes)) : '—'} />
				<KV k="Lives at" v={a.correspondenceAddress ?? '—'} />
			</Card>
			{g?.guarantorRelationships ? (
				<Card>
					<KText v="heading">Guarantor</KText>
					<KV k="Name" v={g.guarantorName ?? '—'} />
					<KV k="Relationship" v={guarantorRelationshipLabel(g.guarantorRelationships)} />
					{g.guarantorPhone ? <KV k="Phone" v={g.guarantorPhone} /> : null}
				</Card>
			) : null}
			<HostCaution applicationId={a.id} guestName={a.fullName ?? ''} />
			<Card>
				<KText v="heading">Agreement</KText>
				<KText v="small">{first} has read and signed the tenancy agreement. It takes effect once you accept and they pay.</KText>
				<Button title="Read the signed agreement" variant="ghost" size="sm" onPress={() => setAgreementOpen(true)} />
			</Card>

			<View style={{ gap: 10, paddingBottom: insets.bottom }}>
				<Button title="Message" variant="ghost" icon={<MessageCircle size={16} color={color.fg} />} loading={opening} onPress={message} />
				{canDecide ? (
					<>
						<Button title={`Accept ${first}`} size="lg" icon={<Check size={18} color={color.onAmber} />} onPress={() => setConfirmAccept(true)} />
						<Button title="Decline" variant="quiet" icon={<X size={16} color={color.fg2} />} onPress={() => setConfirmDecline(true)} />
					</>
				) : (
					<KText v="small" center>
						{a.statusDetails ?? st.label}
					</KText>
				)}
			</View>

			<Sheet open={confirmAccept} onClose={() => setConfirmAccept(false)} title={`Accept ${first}?`}>
				<KText v="small">They’ll be asked to pay into Kushi escrow. Other pending applications for this listing will be declined automatically.</KText>
				<Button
					title="Continue"
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
			<Sheet open={confirmDecline} onClose={() => setConfirmDecline(false)} title="Decline this application?">
				<KText v="small">The renter will be notified kindly. This can’t be undone.</KText>
				<Button
					title="Decline"
					variant="danger"
					size="lg"
					block
					loading={declining}
					onPress={async () => {
						const r = await setStatus({ input: { bookingApplicationId: a.id, status: BookingApplicationStatus.Rejected } });
						setConfirmDecline(false);
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t decline', text2: clean(r.error.message) });
						refetch({ requestPolicy: 'network-only' });
					}}
				/>
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
					toast.show({ type: 'success', text2: 'Accepted — we’ve asked the renter to pay into escrow.' });
					refetch({ requestPolicy: 'network-only' });
					return null;
				}}
			/>
			<Sheet open={agreementOpen} onClose={() => setAgreementOpen(false)} title="Tenancy agreement">
				{h ? <Agreement agreement={a.bookingAggrement as never} hosting={h as never} application={a as never} /> : <Skeleton style={{ height: 200 }} />}
			</Sheet>
		</Screen>
	);
}

function Badge({ icon, text, ok }: { icon: React.ReactNode; text: string; ok?: boolean }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: ok ? 'rgba(60,203,142,0.4)' : color.amberLine }}>
			{icon}
			<KText v="xs" style={{ color: ok ? color.success : color.amber }}>
				{text}
			</KText>
		</View>
	);
}

