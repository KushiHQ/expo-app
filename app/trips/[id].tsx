/**
 * One home, end to end: where things stand, the single next action, and everything
 * after move-in (agreement, review, caution deposit — which had no UI before).
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { FileText, Headset, KeyRound, MapPin, MessageCircle, Star, Wallet } from 'lucide-react-native';
import { GuestCaution } from '@/components/k/caution';
import { Button, Card, Divider, Header, KText, KV, Notice, OtpSheet, Photo, Pill, Screen, Sheet, Skeleton, Waypoint } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { date, daysUntil, duration, humanize, naira, place } from '@/lib/k/format';
import { JOURNEY, STAGE, endedReason, progress, stageOf } from '@/lib/k/journey';
import { toast } from '@/lib/hooks/use-toast';
import {
	SupportItemType,
	useCancelBookingApplicationMutation,
	useCancelBookingMutation,
	useCreateUpdateHostingReviewMutation,
	useFinalizeBookingMutation,
	useGuestBookingTenancyAgreementPreviewQuery,
	useInitiateCancelBookingMutation,
	useInitiateFinalizeBookingMutation,
	useInitiateHostingChatMutation,
	useInitiateSupportChatMutation,
	useKBookingApplicationQuery,
	useKBookingQuery
} from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export default function Trip() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [{ data: ad, fetching }, refetchApp] = useKBookingApplicationQuery({ variables: { bookingApplicationId: id }, requestPolicy: 'cache-and-network' });
	const a = ad?.bookingApplication;
	const bid = a?.booking?.id;
	const [{ data: bd }, refetchBk] = useKBookingQuery({ variables: { bookingId: bid ?? '' }, pause: !bid, requestPolicy: 'cache-and-network' });
	const b = bd?.booking;
	const refresh = () => (refetchApp({ requestPolicy: 'network-only' }), bid && refetchBk({ requestPolicy: 'network-only' }));

	if (!a)
		return (
			<Screen header={<Header title="Your home" />}>
				{fetching ? <Skeleton style={{ height: 220, marginTop: 20 }} /> : <Notice tone="danger">We couldn’t find that application.</Notice>}
			</Screen>
		);
	return <TripBody a={a} b={b ?? null} refresh={refresh} />;
}

type A = NonNullable<ReturnType<typeof useKBookingApplicationQuery>[0]['data']>['bookingApplication'];
type B = NonNullable<ReturnType<typeof useKBookingQuery>[0]['data']>['booking'];

function TripBody({ a, b, refresh }: { a: NonNullable<A>; b: B | null; refresh: () => void }) {
	const stage = stageOf({ appStatus: a.status, paymentStatus: b?.paymentStatus, bookingStatus: b?.status });
	const step = progress(stage);
	const interval = a.hosting.paymentInterval ?? 'ANUALLY';
	const autoDays = b?.autoFinalizeAt ? daysUntil(b.autoFinalizeAt) : null;
	const tenancyOver = b?.expiryDate ? new Date(b.expiryDate) < new Date() : false;

	const [, chat] = useInitiateHostingChatMutation();
	const [, support] = useInitiateSupportChatMutation();
	const [, withdraw] = useCancelBookingApplicationMutation();
	const [{ fetching: startingKeys }, initFinalize] = useInitiateFinalizeBookingMutation();
	const [, finalize] = useFinalizeBookingMutation();
	const [{ fetching: startingCancel }, initCancel] = useInitiateCancelBookingMutation();
	const [, cancel] = useCancelBookingMutation();
	const [keysOpen, setKeysOpen] = useState(false);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [confirmWithdraw, setConfirmWithdraw] = useState(false);
	const [confirmCancel, setConfirmCancel] = useState(false);
	const [agreementOpen, setAgreementOpen] = useState(false);

	async function message() {
		const r = await chat({ hostingId: a.hosting.id });
		const cid = r.data?.initiateHostingChat?.id;
		if (cid) router.push(`/chats/${cid}`);
		else toast.show({ type: 'error', text1: 'Couldn’t open chat', text2: clean(r.error?.message) });
	}
	async function help() {
		const r = await support(b ? { itemType: SupportItemType.Booking, itemId: b.id } : {});
		const sid = r.data?.initiateSupportChat?.id;
		router.push(sid ? `/support/${sid}` : '/support');
	}

	const fees = b
		? ([
				['Rent', (b.amount ?? 0) - (b.cautionFee ?? 0) - (b.serviceCharge ?? 0) - (b.legalFee ?? 0) - (b.stampDuty ?? 0) - (b.guestServiceCharge ?? 0)],
				['Caution deposit (refundable)', b.cautionFee],
				['Service charge', b.serviceCharge],
				['Legal & agreement', b.legalFee],
				['Stamp duty', b.stampDuty],
				['Kushi service fee', b.guestServiceCharge]
			].filter(([, v]) => Number(v) > 0) as [string, number][])
		: [];

	return (
		<Screen header={<Header eyebrow="Your home" title={a.hosting.title ?? ''} />} onRefresh={refresh} refreshing={false}>
			{/* Hero */}
			<Pressable onPress={() => router.push(`/hostings/${a.hosting.id}`)} style={{ flexDirection: 'row', gap: 14, paddingTop: 18 }}>
				<Photo assetId={a.hosting.coverImage?.asset?.id} w={300} h={300} style={{ width: 92, height: 92 }} />
				<View style={{ flex: 1, gap: 6 }}>
					<Pill tone={STAGE[stage].tone}>{STAGE[stage].label}</Pill>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
						<MapPin size={13} color={color.muted} />
						<KText v="small">{place(a.hosting.city, a.hosting.state)}</KText>
					</View>
					<KText v="xs">
						{date(b?.commencementDate ?? a.commencementDate)}
						{b?.expiryDate ? ` → ${date(b.expiryDate)}` : ''} · {duration(a.intervalMultiplier ?? 1, interval)}
					</KText>
				</View>
			</Pressable>

			{/* Journey */}
			{stage !== 'ended' ? (
				<View style={{ flexDirection: 'row' }}>
					{JOURNEY.map((w, i) => (
						<View key={w.key} style={{ flex: 1, gap: 8 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Waypoint done={step >= i} active={step + 1 === i} size={12} />
								{i < JOURNEY.length - 1 ? <View style={{ flex: 1, height: 1, backgroundColor: step > i ? color.amber : color.line2, marginHorizontal: 4 }} /> : null}
							</View>
							<KText v="micro" style={{ color: step >= i || step + 1 === i ? color.fg : color.muted, paddingRight: 6 }}>
								{w.label}
							</KText>
						</View>
					))}
				</View>
			) : null}

			{/* Next action */}
			<Card tone={stage === 'accepted' || stage === 'paid' ? 'amber' : undefined}>
				{stage === 'draft' ? (
					<>
						<KText v="title">Finish your application</KText>
						<KText v="small">You started but haven’t submitted yet. Your progress is saved.</KText>
						<Button title="Continue application" onPress={() => router.push(`/hostings/${a.hosting.id}/apply`)} />
						<Button title="Discard" variant="quiet" size="sm" onPress={() => setConfirmWithdraw(true)} />
					</>
				) : stage === 'review' ? (
					<>
						<KText v="title">Your application is with the host</KText>
						<KText v="small">Kushi has checked your details. Hosts usually respond within 3 business days — we’ll notify you the moment they do.</KText>
						{a.statusDetails ? <KText v="xs">Latest: {a.statusDetails}</KText> : null}
						<Button title="Withdraw application" variant="quiet" size="sm" onPress={() => setConfirmWithdraw(true)} />
					</>
				) : stage === 'accepted' ? (
					<>
						<KText v="title">The host said yes — secure your home</KText>
						<KText v="small">Pay {b?.amount ? naira(b.amount) : 'the total'} into Kushi escrow. It’s released to the host only after you confirm you have your keys.</KText>
						{b?.transaction?.reference ? (
							<Button title={`Pay ${b.amount ? naira(b.amount) : 'now'}`} size="lg" icon={<Wallet size={18} color={color.onAmber} />} onPress={() => router.push({ pathname: '/pay', params: { bkId: b.id, ref: b.transaction!.reference! } })} />
						) : (
							<KText v="xs">Your payment link is being prepared — pull to refresh in a moment.</KText>
						)}
					</>
				) : stage === 'paid' ? (
					<>
						<KText v="title">Paid — now get your keys</KText>
						<KText v="small">Message your host to arrange the handover. Once you have your keys and you’re happy, confirm below and Kushi pays the host.</KText>
						{autoDays != null && autoDays >= 0 ? <KText v="xs">If you don’t confirm or raise an issue, this completes automatically on {date(b?.autoFinalizeAt)} ({autoDays} day{autoDays === 1 ? '' : 's'}).</KText> : null}
						{b?.hosting?.street || b?.hosting?.landmarks ? (
							<View style={{ flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2 }}>
								<MapPin size={16} color={color.amber} />
								<KText v="small" style={{ flex: 1 }}>
									<KText v="smallStrong">Address </KText>
									{[b.hosting.street, b.hosting.landmarks, b.hosting.city, b.hosting.state].filter(Boolean).join(', ')}
								</KText>
							</View>
						) : null}
						<Button
							title="I have my keys"
							size="lg"
							icon={<KeyRound size={18} color={color.onAmber} />}
							loading={startingKeys}
							onPress={async () => {
								const r = await initFinalize({ bookingId: b!.id });
								if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t start', text2: clean(r.error.message) });
								setKeysOpen(true);
							}}
						/>
						<View style={{ flexDirection: 'row', gap: 10 }}>
							<Button title="Message host" variant="ghost" style={{ flex: 1 }} icon={<MessageCircle size={16} color={color.fg} />} onPress={message} />
							<Button title="Cancel booking" variant="quiet" style={{ flex: 1 }} onPress={() => setConfirmCancel(true)} />
						</View>
					</>
				) : stage === 'completed' ? (
					<>
						<KText v="title">Welcome home</KText>
						<KText v="small">Your tenancy runs until {date(b?.expiryDate)}. Reach your host anytime from your inbox.</KText>
						<Button title="Tenancy agreement" variant="ghost" icon={<FileText size={16} color={color.fg} />} onPress={() => setAgreementOpen(true)} />
					</>
				) : (
					<>
						<KText v="title">{endedReason(a.status, b?.status)}</KText>
						<KText v="small">{a.statusDetails ?? 'There are plenty more verified homes waiting.'}</KText>
						<Button title="Explore homes" onPress={() => router.navigate('/')} />
					</>
				)}
			</Card>

			{b && (stage === 'paid' || stage === 'completed') ? <ReviewCard hostingId={a.hosting.id} existing={b.userReview} /> : null}
			{b && (b.cautionFee ?? 0) > 0 && (stage === 'paid' || stage === 'completed') ? <GuestCaution booking={b} tenancyOver={tenancyOver} /> : null}

			{fees.length ? (
				<Card>
					<KText v="heading">What you {b?.paymentStatus === 'PAID' ? 'paid' : 'will pay'}</KText>
					{fees.map(([k, v]) => (
						<KV key={k} k={k} v={naira(v)} />
					))}
					<Divider />
					<KV k="Total" v={naira(b?.amount)} strong />
				</Card>
			) : null}

			<Card>
				<KText v="heading">Your application</KText>
				<KV k="Name" v={a.fullName ?? '—'} />
				<KV k="Phone" v={a.phoneNumber ?? '—'} />
				<KV k={a.status === 'IN_PROGRESS' ? 'Started' : 'Applied'} v={date(a.createdAt)} />
				{b ? <Button title="View tenancy agreement" variant="ghost" size="sm" icon={<FileText size={15} color={color.fg} />} onPress={() => setAgreementOpen(true)} /> : null}
				<Button title="Get help from Kushi" variant="ghost" size="sm" icon={<Headset size={15} color={color.fg} />} onPress={help} />
			</Card>

			<Sheet open={confirmWithdraw} onClose={() => setConfirmWithdraw(false)} title="Withdraw this application?">
				<KText v="small">The host will no longer see it. You can apply again later if the home is still available.</KText>
				<Button
					title="Withdraw"
					variant="danger"
					size="lg"
					block
					onPress={async () => {
						const r = await withdraw({ applicationId: a.id });
						setConfirmWithdraw(false);
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t withdraw', text2: clean(r.error.message) });
						refresh();
					}}
				/>
			</Sheet>
			<Sheet open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this booking?">
				<KText v="small">Refunds follow the Kushi cancellation policy. We’ll email you a code to confirm.</KText>
				<Button
					title="Continue"
					variant="danger"
					size="lg"
					block
					loading={startingCancel}
					onPress={async () => {
						const r = await initCancel({ bookingId: b!.id });
						setConfirmCancel(false);
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t start', text2: clean(r.error.message) });
						setCancelOpen(true);
					}}
				/>
			</Sheet>
			{b ? (
				<>
					<OtpSheet
						open={keysOpen}
						onClose={() => setKeysOpen(false)}
						title="Confirm you have your keys"
						body="This tells Kushi you’ve moved in and releases the rent to your host."
						action="Confirm — I have my keys"
						onResend={async () => void (await initFinalize({ bookingId: b.id }))}
						onSubmit={async (otp) => {
							const r = await finalize({ bookingId: b.id, otp });
							if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
							toast.show({ type: 'success', text1: 'Welcome home!', text2: 'Your host has been paid.' });
							refresh();
							return null;
						}}
					/>
					<OtpSheet
						open={cancelOpen}
						onClose={() => setCancelOpen(false)}
						title="Cancel booking"
						body="Enter the code we emailed you to cancel."
						action="Cancel booking"
						danger
						onSubmit={async (otp) => {
							const r = await cancel({ bookingId: b.id, otp });
							if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
							toast.show({ type: 'info', text2: 'Booking cancelled.' });
							refresh();
							return null;
						}}
					/>
					<AgreementSheet open={agreementOpen} onClose={() => setAgreementOpen(false)} bookingId={b.id} pdfUrl={b.tenancyAgreementAsset?.publicUrl} />
				</>
			) : null}
		</Screen>
	);
}

function AgreementSheet({ open, onClose, bookingId, pdfUrl }: { open: boolean; onClose: () => void; bookingId: string; pdfUrl?: string | null }) {
	const [{ data }] = useGuestBookingTenancyAgreementPreviewQuery({ variables: { bookingId }, pause: !open || !!pdfUrl });
	const html = data?.guestBookingTenancyAgreementPreview;
	return (
		<Sheet open={open} onClose={onClose} title="Tenancy agreement" scroll={false}>
			<View style={{ height: 520, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#fff' }}>
				{pdfUrl ? (
					<WebView source={{ uri: pdfUrl }} />
				) : html ? (
					<WebView source={{ html: `<meta name="viewport" content="width=device-width, initial-scale=1">${html}` }} />
				) : (
					<Skeleton style={{ flex: 1, borderRadius: 0 }} />
				)}
			</View>
		</Sheet>
	);
}

const CATS = [
	['cleanliness', 'Cleanliness'],
	['accuracy', 'Accuracy'],
	['communication', 'Communication'],
	['location', 'Location'],
	['checkIn', 'Move-in'],
	['value', 'Value']
] as const;

function ReviewCard({ hostingId, existing }: { hostingId: string; existing?: { id: string; description?: string | null } & Partial<Record<(typeof CATS)[number][0], number | null>> | null }) {
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
	return (
		<Card>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
				<Star size={17} color={color.amber} />
				<KText v="heading">{existing || saved ? 'Your review' : 'Review this home'}</KText>
			</View>
			<KText v="xs">Honest reviews keep Kushi trustworthy for the next renter.</KText>
			{CATS.map(([k, l]) => (
				<View key={k} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<KText v="small">{l}</KText>
					<View style={{ flexDirection: 'row', gap: 2 }}>
						{[1, 2, 3, 4, 5].map((n) => (
							<Pressable key={n} hitSlop={4} onPress={() => setScores((s) => ({ ...s, [k]: n }))} accessibilityLabel={`${l} ${n} stars`} style={{ padding: 2 }}>
								<Star size={20} color={(scores[k] ?? 0) >= n ? color.amber : color.line2} fill={(scores[k] ?? 0) >= n ? color.amber : 'transparent'} />
							</Pressable>
						))}
					</View>
				</View>
			))}
			<TextInput value={text} onChangeText={setText} multiline placeholder="What should the next renter know?" placeholderTextColor={color.dim} style={st.textarea} />
			<Button
				title={existing || saved ? 'Update review' : 'Post review'}
				disabled={!ok}
				loading={fetching}
				onPress={async () => {
					const r = await save({ input: { hostingId, id: existing?.id, description: text.trim() || null, ...scores } });
					if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t save', text2: clean(r.error.message) });
					setSaved(true);
					toast.show({ type: 'success', text2: 'Thanks — your review helps the next renter.' });
				}}
			/>
		</Card>
	);
}

const st = StyleSheet.create({
	textarea: { minHeight: 90, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg, color: color.fg, fontFamily: font.body, fontSize: 15, textAlignVertical: 'top' },
	claim: { gap: 6, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2 },
	input: { height: 50, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg, color: color.fg, fontFamily: font.body, fontSize: 16 }
});
