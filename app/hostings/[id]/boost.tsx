import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Rocket, TrendingUp } from 'lucide-react-native';
import { Button, Choice, Empty, Header, KText, Notice, Screen, Sheet, Skeleton } from '@/components/k';
import { color } from '@/lib/k/theme';
import { naira } from '@/lib/k/format';
import { cleanError } from '@/lib/k/use-listing-step';
import { useUser } from '@/lib/hooks/user';
import { toast } from '@/lib/hooks/use-toast';
import { ListingTier, TransactionStatus, useHostingQuery, useInitiateListingBoostMutation, useListingBoostCatalogueQuery, useVerifyListingBoostMutation } from '@/lib/services/graphql/generated';

/** Pay to rank a listing higher in search and the feed for a set number of days. */
export default function Boost() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const user = useUser();
	const [{ data, fetching, error }, refetch] = useListingBoostCatalogueQuery();
	const [{ data: hd }] = useHostingQuery({ variables: { hostingId: String(id) } });
	const options = data?.listingBoostCatalogue ?? [];
	const [tier, setTier] = useState<ListingTier | null>(null);
	const [ref, setRef] = useState('');
	const [amount, setAmount] = useState(0);
	const [pendingOpen, setPendingOpen] = useState(false);
	const [success, setSuccess] = useState(false);
	const openPay = useRef<(() => void) | null>(null);
	const [{ fetching: starting }, initiate] = useInitiateListingBoostMutation();
	const [{ fetching: verifying }, verify] = useVerifyListingBoostMutation();
	const chosen = options.find((o) => o.tier === tier);
	const live = hd?.hosting?.publishStatus === 'LIVE';

	// Open Flutterwave once `initiate` has minted a fresh reference.
	useEffect(() => {
		if (pendingOpen && openPay.current) {
			openPay.current();
			setPendingOpen(false);
		}
	}, [ref, pendingOpen]);

	function onRedirect(r: { status: string; tx_ref: string }) {
		if (r.status === 'cancelled') return toast.show({ type: 'info', text2: 'Payment cancelled. You haven’t been charged.' });
		verify({ reference: ref }).then((res) => {
			if (res.error) return toast.show({ type: 'error', text1: 'We couldn’t confirm the payment', text2: cleanError(res.error.message) });
			const tx = res.data?.verifyListingBoost;
			if (tx?.data?.status === TransactionStatus.Success) setSuccess(true);
			else toast.show({ type: 'info', text1: 'Payment pending', text2: tx?.message ?? 'We’ll apply the boost once the payment clears.' });
		});
	}

	function pay() {
		if (!tier) return;
		initiate({ hostingId: String(id), tier }).then((res) => {
			if (res.error) return toast.show({ type: 'error', text1: 'Couldn’t start the payment', text2: cleanError(res.error.message) });
			const tx = res.data?.initiateListingBoost?.data;
			if (!tx?.reference) return;
			setRef(tx.reference);
			setAmount(Number(tx.amount));
			setPendingOpen(true);
		});
	}

	return (
		<Screen
			width="form"
			header={<Header eyebrow={hd?.hosting?.title ?? 'Listing'} title="Boost" />}
			contentStyle={{ paddingTop: 20 }}
			footer={
				<PayWithFlutterwave
					onRedirect={onRedirect}
					options={{
						authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? '',
						amount,
						tx_ref: ref,
						currency: 'NGN',
						customer: { email: user.user.email ?? '', name: user.user.user?.profile.fullName },
						customizations: { title: 'Kushi Listing Boost', description: chosen ? `${chosen.label} boost` : 'Boost your listing', logo: 'https://res.cloudinary.com/dev-media/image/upload/v1772369352/logo_miq5eq.png' }
					}}
					customButton={(p) => {
						openPay.current = p.onPress;
						return <Button title={chosen ? `Pay ${naira(Number(chosen.price))}` : 'Choose a boost'} size="lg" block disabled={!tier || !live || p.disabled} loading={starting || verifying} onPress={pay} />;
					}}
				/>
			}
		>
			<View style={{ gap: 8 }}>
				<Rocket size={26} color={color.amber} />
				<KText v="title">Get seen by more renters</KText>
				<KText v="small">A boost puts this listing nearer the top of search and the home feed for the days you choose. It doesn’t change your price or verification.</KText>
			</View>
			{!live && hd ? <Notice tone="warn" title="Publish first">Only live listings can be boosted.</Notice> : null}
			{fetching && !data ? (
				<View style={{ gap: 10 }}>
					<Skeleton style={{ height: 72 }} />
					<Skeleton style={{ height: 72 }} />
				</View>
			) : error ? (
				<Empty eyebrow="Offline" title="Boosts didn’t load" body={cleanError(error.message)} action="Try again" onAction={() => refetch({ requestPolicy: 'network-only' })} />
			) : (
				options.map((o) => <Choice key={o.tier} title={`${o.label} · ${naira(Number(o.price))}`} detail={`${o.durationDays} days${o.description ? ` — ${o.description}` : ''}`} on={tier === o.tier} onPress={() => setTier(o.tier)} />)
			)}
			<KText v="xs">Payment is handled securely by Flutterwave.</KText>

			<Sheet open={success} onClose={() => setSuccess(false)} title="Boost is on" eyebrow="Paid">
				<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
					<TrendingUp size={18} color={color.success} />
					<KText v="small" style={{ flex: 1 }}>
						Your {chosen?.label ?? ''} boost runs for {chosen?.durationDays ?? 30} days. Check Insights to see the difference.
					</KText>
				</View>
				<Button title="See insights" block onPress={() => { setSuccess(false); router.replace(`/hostings/${id}/insights`); }} />
				<Button title="Done" variant="ghost" block onPress={() => { setSuccess(false); router.back(); }} />
			</Sheet>
		</Screen>
	);
}
