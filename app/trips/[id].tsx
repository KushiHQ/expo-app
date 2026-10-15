/**
 * One home, end to end — the single screen for an application and its booking
 * (old /bookings/:id, /users/booking-applications/:id and the reservation
 * checkout all land here). Where things stand, the one next action, the money,
 * the documents, and everything after moving in (caution deposit, review).
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useQuery } from 'urql';
import { FileText, Headset, KeyRound, MapPin, MessageCircle, Receipt, RefreshCw, Wallet } from 'lucide-react-native';
import { GuestCaution } from '@/components/k/caution';
import { AddressBlock, AgreementSheet, CancelSheet, ErrorState, FeeBreakdown, JourneyTrack, ReceiptSheet, ReviewCard } from '@/components/k/booking';
import { QuoteLines, useQuote } from '@/components/k/quote';
import { Button, Card, Empty, Header, KText, KV, Notice, OtpSheet, Photo, Pill, Row, Screen, Sheet, Skeleton } from '@/components/k';
import { Pressable } from '@/components/k/pressable';
import { color, radius } from '@/lib/k/theme';
import { date, duration, naira, place } from '@/lib/k/format';
import { STAGE, endedReason, progress, stageOf } from '@/lib/k/journey';
import { useLayout } from '@/lib/k/layout';
import { EMPLOYMENT, GRACE_DAYS, HOUSEHOLD, INCOME, RELATION, TRIP, awaitingPayment, canWithdraw, clean, graceText, handoverWords, inGrace, num, type Trip } from '@/lib/k/booking';
import { useUserStore } from '@/lib/stores/users';
import { toast } from '@/lib/hooks/use-toast';
import {
	SupportItemType,
	useCancelBookingApplicationMutation,
	useCancelBookingMutation,
	useFinalizeBookingMutation,
	useInitiateCancelBookingMutation,
	useInitiateFinalizeBookingMutation,
	useInitiateHostingChatMutation,
	useInitiateSupportChatMutation
} from '@/lib/services/graphql/generated';

export default function TripScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const me = useUserStore((s) => s.user.user?.id);
	const [{ data, fetching, error }, refetch] = useQuery<{ bookingApplication: Trip | null }>({ query: TRIP, variables: { id: String(id) }, requestPolicy: 'cache-and-network', pause: !id });
	const t = data?.bookingApplication;
	const refresh = () => refetch({ requestPolicy: 'network-only' });

	if (t && me && t.hosting.host?.user.id === me && t.guest.user.id !== me) return <Redirect href={`/applications/${t.id}`} />;
	if (!t)
		return (
			<Screen header={<Header eyebrow="Your home" title="Loading…" />}>
				{fetching || (!data && !error) ? (
					<View style={{ gap: 14, paddingTop: 18 }}>
						<Skeleton style={{ height: 180, borderRadius: radius.lg }} />
						<Skeleton style={{ height: 40 }} />
						<Skeleton style={{ height: 160, borderRadius: radius.lg }} />
					</View>
				) : error ? (
					<ErrorState title="We couldn’t load this home" body={clean(error.message).includes('Network') ? 'You seem to be offline. Check your connection and try again.' : clean(error.message)} onRetry={refresh} />
				) : (
					<Empty eyebrow="Off the map" title="We couldn’t find that application" body="It may have been removed. Everything you’ve applied for is under Homes." action="Go to Homes" onAction={() => router.replace('/trips')} />
				)}
			</Screen>
		);
	return <TripBody t={t} refresh={refresh} refreshing={fetching} />;
}

function TripBody({ t, refresh, refreshing }: { t: Trip; refresh: () => void; refreshing: boolean }) {
	const L = useLayout();
	const wide = L.expanded;
	const b = t.booking ?? null;
	const stage = stageOf({ appStatus: t.status, paymentStatus: b?.paymentStatus, bookingStatus: b?.status });
	const interval = t.hosting.paymentInterval ?? 'ANUALLY';
	const words = handoverWords(b?.hosting.propertyType ?? t.hosting.propertyType);
	const tenancyOver = b?.expiryDate ? new Date(b.expiryDate) < new Date() : false;
	const hostName = t.hosting.host?.user.profile?.fullName?.split(' ')[0] ?? 'your host';
	const { quote, fetching: quoting } = useQuote(t.hosting.id, t.intervalMultiplier ?? 1, !!b || stage === 'ended');

	const [{ fetching: chatting }, chat] = useInitiateHostingChatMutation();
	const [{ fetching: helping }, support] = useInitiateSupportChatMutation();
	const [{ fetching: withdrawing }, withdraw] = useCancelBookingApplicationMutation();
	const [{ fetching: startingKeys }, initFinalize] = useInitiateFinalizeBookingMutation();
	const [, finalize] = useFinalizeBookingMutation();
	const [{ fetching: startingCancel }, initCancel] = useInitiateCancelBookingMutation();
	const [, cancel] = useCancelBookingMutation();
	const [sheet, setSheet] = useState<null | 'keys-confirm' | 'keys-otp' | 'cancel' | 'cancel-otp' | 'withdraw' | 'agreement' | 'receipt'>(null);
	const close = () => setSheet(null);

	async function message() {
		const r = await chat({ hostingId: t.hosting.id });
		const cid = r.data?.initiateHostingChat?.id;
		if (cid) router.push(`/chats/${cid}`);
		else toast.show({ type: 'error', text1: 'Couldn’t open the chat', text2: clean(r.error?.message) || 'Try again in a moment.' });
	}
	async function help() {
		const r = await support(b ? { itemType: SupportItemType.Booking, itemId: b.id } : {});
		const sid = r.data?.initiateSupportChat?.id;
		router.push(sid ? `/support/${sid}` : '/support');
	}
	const pay = () => b && router.push({ pathname: '/pay', params: b.transaction?.reference ? { bkId: b.id, ref: b.transaction.reference } : { bkId: b.id } });

	const notes = {
		applied: t.status === 'IN_PROGRESS' ? undefined : date(t.createdAt),
		paid: b?.paymentStatus === 'PAID' ? date(b.transaction?.lastUpdated ?? b.lastUpdated) : undefined,
		keys: b?.status === 'COMPLETED' ? date(b.lastUpdated) : undefined
	};

	const hero = (
		<Pressable accessibilityRole="button" accessibilityLabel={`Open the listing for ${t.hosting.title ?? 'this home'}`} onPress={() => router.push(`/hostings/${t.hosting.id}`)} style={({ pressed }) => [{ gap: 14, paddingTop: 18 }, pressed && { opacity: 0.85 }]}>
			<Photo assetId={t.hosting.coverImage?.asset?.id} w={900} h={500} style={{ width: '100%', aspectRatio: wide ? 2.2 : 16 / 9 }} radius={radius.lg} priority />
			<View style={{ gap: 6 }}>
				<Pill tone={STAGE[stage].tone}>{stage === 'paid' ? `Paid · awaiting ${words.thing}` : STAGE[stage].label}</Pill>
				<KText v="title">{t.hosting.title ?? 'Home'}</KText>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
					<MapPin size={13} color={color.muted} />
					<KText v="small">{place(t.hosting.city, t.hosting.state) || '—'}</KText>
				</View>
				<KText v="xs">
					{date(b?.commencementDate ?? t.commencementDate)}
					{b?.expiryDate ? ` → ${date(b.expiryDate)}` : ''} · {duration(t.intervalMultiplier ?? 1, interval)}
				</KText>
			</View>
		</Pressable>
	);

	const next = (
		<Card tone={stage === 'accepted' || stage === 'paid' ? 'amber' : undefined}>
			{stage === 'draft' ? (
				<>
					<KText v="title">Finish your application</KText>
					<KText v="small">You started but haven’t sent it yet. Your answers are saved — pick up where you left off.</KText>
					<Button title="Continue application" testID="trip-continue" onPress={() => router.push(`/hostings/${t.hosting.id}/apply`)} />
					<Button title="Discard application" variant="quiet" size="sm" onPress={() => setSheet('withdraw')} />
				</>
			) : stage === 'review' ? (
				<>
					<KText v="title">{t.status === 'SUBMITED' ? 'Kushi is checking your application' : 'Your application is with the host'}</KText>
					<KText v="small">
						{t.status === 'SUBMITED'
							? 'We check your details first, usually within a day. Then the host decides — typically within 3 business days. We’ll notify you either way.'
							: 'Kushi has checked your details. Hosts usually decide within 3 business days, and we’ll notify you the moment they do. You won’t pay anything until they accept.'}
					</KText>
					{t.statusDetails ? <KText v="xs">Latest: {t.statusDetails}</KText> : null}
					<Button title={`Message ${hostName}`} variant="ghost" loading={chatting} icon={<MessageCircle size={16} color={color.fg} />} onPress={message} />
					{canWithdraw(t.status) ? <Button title="Withdraw application" variant="quiet" size="sm" onPress={() => setSheet('withdraw')} /> : null}
				</>
			) : stage === 'accepted' ? (
				<>
					<KText v="title">{hostName === 'your host' ? 'The host' : hostName} said yes — secure your home</KText>
					<KText v="small">Pay {b ? naira(num(b.amount)) : 'the total'} to Kushi. We hold it in escrow and release it to the host only after you confirm the handover (or {GRACE_DAYS} days after paying, if you don’t raise an issue).</KText>
					{b?.paymentStatus === 'FAILED' ? <Notice tone="warn">Your last payment attempt didn’t go through. If money left your account, it’s confirmed automatically — otherwise try again.</Notice> : null}
					{b && awaitingPayment(b) ? (
						<Button title={`Pay ${naira(num(b.amount))}`} size="lg" testID="pay-now" icon={<Wallet size={18} color={color.onAmber} />} onPress={pay} />
					) : (
						<>
							<KText v="xs">Your booking is being set up. This usually takes a few seconds.</KText>
							<Button title="Refresh" variant="ghost" size="sm" icon={<RefreshCw size={15} color={color.fg} />} loading={refreshing} onPress={refresh} />
						</>
					)}
				</>
			) : stage === 'paid' && b ? (
				<>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
						<KText v="title" style={{ flexShrink: 1 }}>
							Paid — now get your {words.thing}
						</KText>
						{inGrace(b) ? <Pill tone="warn">{graceText(b.autoFinalizeAt)}</Pill> : null}
					</View>
					<KText v="small">
						Your money is safe in Kushi escrow. Arrange the handover with {hostName}. Once you have your {words.thing} and you’re happy, confirm below and Kushi pays the host.
					</KText>
					<KText v="xs">
						{b.autoFinalizeAt
							? `If you don’t confirm or cancel, the booking completes automatically on ${date(b.autoFinalizeAt)} and the host is paid.`
							: `If you don’t confirm or cancel, the booking completes automatically ${GRACE_DAYS} days after payment.`}
					</KText>
					<AddressBlock hosting={b.hosting} />
					<Button title={words.confirm} size="lg" testID="confirm-keys" icon={<KeyRound size={18} color={color.onAmber} />} onPress={() => setSheet('keys-confirm')} />
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title={`Message ${hostName}`} variant="ghost" style={{ flex: 1 }} loading={chatting} icon={<MessageCircle size={16} color={color.fg} />} onPress={message} />
						<Button title="Cancel booking" variant="quiet" style={{ flex: 1 }} testID="cancel-booking" onPress={() => setSheet('cancel')} />
					</View>
				</>
			) : stage === 'completed' ? (
				<>
					<KText v="title">Welcome home</KText>
					<KText v="small">
						Your tenancy runs {b?.commencementDate ? `from ${date(b.commencementDate)} ` : ''}until {date(b?.expiryDate)}. Your signed tenancy agreement was emailed to you and is saved below.
					</KText>
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title="Agreement" variant="ghost" style={{ flex: 1 }} icon={<FileText size={16} color={color.fg} />} onPress={() => setSheet('agreement')} />
						<Button title={`Message ${hostName}`} variant="ghost" style={{ flex: 1 }} loading={chatting} icon={<MessageCircle size={16} color={color.fg} />} onPress={message} />
					</View>
				</>
			) : (
				<>
					<KText v="title">{endedReason(t.status, b?.status)}</KText>
					<KText v="small">
						{b?.status === 'CANCELED'
							? `Your refund goes back to the card you paid with within 5–7 business days. ${t.statusDetails ?? ''}`.trim()
							: (t.statusDetails ?? 'There are plenty more verified homes waiting.')}
					</KText>
					<Button title="Explore homes" onPress={() => router.navigate('/')} />
				</>
			)}
		</Card>
	);

	const money = b ? (
		<FeeBreakdown booking={b} stage={stage} />
	) : stage === 'draft' || stage === 'review' ? (
		<Card>
			<KText v="heading">Due after the host accepts</KText>
			<QuoteLines quote={quote} fetching={quoting} />
			<KText v="xs">You won’t be charged until then. Prices can change if the host updates the listing.</KText>
		</Card>
	) : null;

	const g = t.guestFormData;
	const details = (
		<Card>
			<KText v="heading">Your application</KText>
			<KV k="Name" v={t.fullName ?? '—'} />
			<KV k="Phone" v={t.phoneNumber ?? '—'} />
			{t.email ? <KV k="Email" v={t.email} /> : null}
			<KV k="Move in" v={date(t.commencementDate)} />
			<KV k="Length" v={duration(t.intervalMultiplier ?? 1, interval)} />
			{g ? <KV k="Work" v={`${EMPLOYMENT[g.employmentStatus] ?? g.employmentStatus}${g.incomeRanges ? ` · ${INCOME[g.incomeRanges] ?? ''}` : ''}`} /> : null}
			{g?.occupancyTypes ? <KV k="Household" v={HOUSEHOLD[g.occupancyTypes] ?? g.occupancyTypes} /> : null}
			{g?.guarantorRelationships ? <KV k="Guarantor" v={`${g.guarantorName ?? '—'} (${RELATION[g.guarantorRelationships] ?? g.guarantorRelationships})`} /> : null}
			<KV k={t.status === 'IN_PROGRESS' ? 'Started' : 'Applied'} v={date(t.createdAt)} />
			{b ? <KV k="Booking reference" v={b.bookingReference} /> : null}
		</Card>
	);

	const docs = (
		<Card>
			<KText v="heading">Documents & help</KText>
			<View>
				{b ? <Row icon={<FileText size={17} color={color.amber} />} title="Tenancy agreement" detail={b.tenancyAgreementAsset ? 'Signed copy · PDF' : 'Preview — the signed copy arrives when the booking completes'} onPress={() => setSheet('agreement')} /> : null}
				{b?.paymentStatus === 'PAID' ? <Row icon={<Receipt size={17} color={color.amber} />} title="Receipt" detail={`${naira(num(b.amount))} · ${b.bookingReference}`} onPress={() => setSheet('receipt')} /> : null}
				<Row icon={<MessageCircle size={17} color={color.amber} />} title={`Message ${hostName}`} detail="Questions about the home or the handover" onPress={message} />
				<Row icon={<Headset size={17} color={color.amber} />} title="Get help from Kushi" detail={helping ? 'Opening…' : 'Payments, refunds, disputes'} onPress={help} />
			</View>
		</Card>
	);

	const after =
		b && (stage === 'paid' || stage === 'completed') ? (
			<>
				{num(b.cautionFee) > 0 ? <GuestCaution booking={b} tenancyOver={tenancyOver} /> : null}
				<ReviewCard hostingId={t.hosting.id} existing={b.userReview} onSaved={refresh} />
			</>
		) : null;

	const main = (
		<>
			{hero}
			{stage !== 'ended' ? <JourneyTrack step={progress(stage)} labels={{ keys: words.waypoint }} notes={notes} /> : null}
			{next}
			{after}
		</>
	);
	const side = (
		<>
			{money}
			{docs}
			{details}
		</>
	);

	return (
		<Screen header={<Header eyebrow="Your home" title={t.hosting.title ?? 'Home'} />} width={wide ? 'content' : 'reading'} padded onRefresh={refresh} refreshing={false}>
			{wide ? (
				<View style={{ flexDirection: 'row', gap: 28, alignItems: 'flex-start' }}>
					<View style={{ flex: 1.35, gap: 20 }}>{main}</View>
					<View style={{ flex: 1, gap: 20, paddingTop: 18 }}>{side}</View>
				</View>
			) : (
				<>
					{main}
					{side}
				</>
			)}

			<Sheet open={sheet === 'withdraw'} onClose={close} title={t.status === 'IN_PROGRESS' ? 'Discard this application?' : 'Withdraw this application?'}>
				<KText v="small">The host won’t see it any more. You can apply again later if the home is still available.</KText>
				<Button
					title={t.status === 'IN_PROGRESS' ? 'Discard' : 'Withdraw'}
					variant="danger"
					size="lg"
					block
					loading={withdrawing}
					onPress={async () => {
						const r = await withdraw({ applicationId: t.id });
						close();
						if (r.error) return toast.show({ type: 'error', text1: 'Couldn’t withdraw', text2: clean(r.error.message) });
						toast.show({ type: 'info', text2: 'Application withdrawn.' });
						refresh();
					}}
				/>
			</Sheet>

			{b ? (
				<>
					<Sheet open={sheet === 'keys-confirm'} onClose={close} title={`Do you have your ${words.thing}?`} eyebrow="This releases the payment">
						<KText v="small">
							Confirming tells Kushi you’ve {words.thing === 'keys' ? 'received your keys and moved in' : 'taken possession'}. Kushi then pays the host and sends you the signed tenancy agreement. This can’t be undone, and you can’t cancel afterwards.
						</KText>
						<Notice tone="warn">Only confirm once you’re in and everything is as agreed. If something’s wrong, message the host or Kushi first.</Notice>
						<Button
							title="Email me a code to confirm"
							size="lg"
							block
							loading={startingKeys}
							onPress={async () => {
								const r = await initFinalize({ bookingId: b.id });
								if (r.error) {
									close();
									return toast.show({ type: 'error', text1: 'Couldn’t start', text2: clean(r.error.message) });
								}
								setSheet('keys-otp');
							}}
						/>
						<Button title="Not yet" variant="quiet" block onPress={close} />
					</Sheet>
					<OtpSheet
						open={sheet === 'keys-otp'}
						onClose={close}
						title={`Confirm — ${words.done.toLowerCase()}`}
						body={`Enter the 6-digit code we emailed to ${b.email}. Kushi then releases the payment to the host.`}
						action="Confirm and pay the host"
						onResend={async () => void (await initFinalize({ bookingId: b.id }))}
						onSubmit={async (otp) => {
							const r = await finalize({ bookingId: b.id, otp });
							if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
							toast.show({ type: 'success', text1: 'Welcome home!', text2: 'Your signed tenancy agreement is on its way to your email.' });
							refresh();
							return null;
						}}
					/>
					<CancelSheet
						open={sheet === 'cancel'}
						onClose={close}
						booking={b}
						busy={startingCancel}
						onContinue={async () => {
							const r = await initCancel({ bookingId: b.id });
							if (r.error) {
								close();
								return toast.show({ type: 'error', text1: 'Couldn’t cancel', text2: clean(r.error.message) });
							}
							setSheet('cancel-otp');
						}}
					/>
					<OtpSheet
						open={sheet === 'cancel-otp'}
						onClose={close}
						title="Cancel booking"
						body={`Enter the 6-digit code we emailed to ${b.email} to cancel this booking.`}
						action="Cancel booking"
						danger
						onResend={async () => void (await initCancel({ bookingId: b.id }))}
						onSubmit={async (otp) => {
							const r = await cancel({ bookingId: b.id, otp });
							if (r.error) return clean(r.error.graphQLErrors[0]?.message ?? r.error.message);
							toast.show({ type: 'info', text1: 'Booking cancelled', text2: 'Your refund will reach your card within 5–7 business days.' });
							refresh();
							return null;
						}}
					/>
					<AgreementSheet open={sheet === 'agreement'} onClose={close} bookingId={b.id} pdfUrl={b.tenancyAgreementAsset?.publicUrl} />
					<ReceiptSheet open={sheet === 'receipt'} onClose={close} booking={b} title={t.hosting.title ?? 'Home'} />
				</>
			) : null}
		</Screen>
	);
}

