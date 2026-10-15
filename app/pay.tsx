/**
 * Pay into escrow. Same proven flow as before: refresh the payment reference
 * (retryBookingPayment), open Flutterwave, then verify with the server.
 */
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import { BadgeCheck, KeyRound, Landmark, Lock, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Eyebrow, Header, KText, KV, Notice, Photo, Screen, Skeleton } from '@/components/k';
import { color, font } from '@/lib/k/theme';
import { date, naira, place } from '@/lib/k/format';
import { useUserStore } from '@/lib/stores/users';
import { PaymentStatus, useKBookingQuery, useRetryBookingPaymentMutation, useTransactionByReferenceQuery, useVerifyBookingPaymentMutation } from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export default function Pay() {
	const { bkId, ref } = useLocalSearchParams<{ bkId: string; ref: string }>();
	const me = useUserStore((s) => s.user);
	const [activeRef, setActiveRef] = useState(String(ref ?? ''));
	const [pending, setPending] = useState(false);
	const open = useRef<(() => void) | null>(null);
	const [{ data: bd }, refetch] = useKBookingQuery({ variables: { bookingId: String(bkId) }, pause: !bkId });
	const [{ data: tx }] = useTransactionByReferenceQuery({ variables: { reference: activeRef }, pause: !activeRef });
	const [{ fetching: refreshing }, retry] = useRetryBookingPaymentMutation();
	const [{ fetching: verifying }, verify] = useVerifyBookingPaymentMutation();
	const [error, setError] = useState<string | null>(null);
	const [paid, setPaid] = useState(false);
	const b = bd?.booking;
	const amount = Number(tx?.transactionByReference?.amount ?? b?.amount ?? 0);
	const already = paid || b?.paymentStatus === PaymentStatus.Paid;

	useEffect(() => {
		if (pending && open.current) {
			open.current();
			setPending(false);
		}
	}, [activeRef, pending]);

	async function check(status?: string) {
		if (status === 'cancelled') return;
		const r = await verify({ verifyBookingPaymentId: String(bkId) });
		if (r.error) return setError(clean(r.error.message) + ' If money left your account, it’ll be confirmed automatically — contact support with your reference.');
		if (r.data?.verifyBookingPayment?.data?.paymentStatus === PaymentStatus.Paid) {
			setPaid(true);
			refetch({ requestPolicy: 'network-only' });
		} else setError('We haven’t received the payment yet. If you completed it, give it a minute and check again.');
	}

	async function payNow() {
		setError(null);
		const r = await retry({ bookingId: String(bkId) });
		if (r.error) {
			if (r.error.message.includes('already been completed')) return check('success');
			return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		}
		const fresh = r.data?.retryBookingPayment?.data?.reference;
		if (!fresh) return;
		if (fresh !== activeRef) {
			setActiveRef(fresh);
			setPending(true);
		} else open.current?.();
	}

	const tripId = b?.bookingApplication?.id;
	return (
		<Screen width="form" header={<Header eyebrow="Secure your home" title="Pay into escrow" />}>
			{!b ? (
				<View style={{ gap: 12, paddingTop: 20 }}>
					<Skeleton style={{ height: 90 }} />
					<Skeleton style={{ height: 160 }} />
				</View>
			) : already ? (
				<View style={{ gap: 16, paddingTop: 30 }}>
					<BadgeCheck size={40} color={color.success} />
					<Eyebrow>Payment secured</Eyebrow>
					<KText v="display">{paid ? 'Paid. Your home is secured.' : 'This booking is already paid.'}</KText>
					<KText v="lead">{naira(amount)} is held in Kushi escrow. Message your host to arrange the handover, then confirm in Kushi once you have your keys.</KText>
					<Button title="Go to your home" size="lg" block onPress={() => router.replace(tripId ? `/trips/${tripId}` : '/trips')} />
				</View>
			) : (
				<>
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: 16 }}>
						<Photo assetId={b.hosting.coverImage?.asset?.id} w={240} h={240} style={{ width: 72, height: 72 }} />
						<View style={{ flex: 1 }}>
							<KText v="bodyStrong" numberOfLines={2}>
								{b.hosting.title}
							</KText>
							<KText v="xs">
								{place(b.hosting.city, b.hosting.state)} · {date(b.commencementDate)} → {date(b.expiryDate)}
							</KText>
						</View>
					</View>
					<View style={{ gap: 4, paddingVertical: 8 }}>
						<KText v="label">Total due</KText>
						<KText style={{ fontFamily: font.display, fontSize: 40, letterSpacing: -2, color: color.fg }}>{naira(amount)}</KText>
						{b.cautionFee ? <KText v="xs">Includes a refundable caution deposit of {naira(b.cautionFee)}.</KText> : null}
					</View>
					<Card>
						<KV k="Rent & charges" v={naira(amount - (b.cautionFee ?? 0))} />
						{b.cautionFee ? <KV k="Caution deposit (refundable)" v={naira(b.cautionFee)} /> : null}
						<KV k="Reference" v={activeRef || '—'} />
					</Card>
					<View style={{ gap: 12 }}>
						{[
							[Lock, 'You pay Kushi — not the host.'],
							[Landmark, 'We hold it in escrow while you arrange the handover.'],
							[KeyRound, 'The host is paid only after you confirm you have your keys.']
						].map(([I, t]) => {
							const Icon = I as typeof Lock;
							return (
								<View key={t as string} style={{ flexDirection: 'row', gap: 10 }}>
									<Icon size={17} color={color.amber} />
									<KText v="small" style={{ flex: 1 }}>
										{t as string}
									</KText>
								</View>
							);
						})}
					</View>
					{error ? <Notice tone="danger">{error}</Notice> : null}
					<PayWithFlutterwave
						onRedirect={(d: { status: string }) => check(d.status)}
						options={{
							authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '',
							amount,
							tx_ref: activeRef,
							currency: 'NGN',
							customer: { email: me.email ?? '', phonenumber: b.phoneNumber, name: me.user?.profile?.fullName ?? b.fullName },
							customizations: { title: 'Kushi Housing', description: `Escrow payment · ${b.hosting.title}`, logo: 'https://res.cloudinary.com/dev-media/image/upload/v1772369352/logo_miq5eq.png' }
						}}
						customButton={(props: { onPress: () => void; disabled?: boolean }) => {
							open.current = props.onPress;
							return <Button title={refreshing ? 'Preparing secure checkout…' : `Pay ${naira(amount)} securely`} size="lg" block icon={<ShieldCheck size={18} color={color.onAmber} />} loading={verifying} disabled={props.disabled || refreshing} onPress={payNow} />;
						}}
					/>
					<KText v="xs" center>
						Card, bank transfer or USSD via Flutterwave.
					</KText>
				</>
			)}
		</Screen>
	);
}
