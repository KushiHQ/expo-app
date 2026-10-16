import { useEffect } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Check, Clock, FileSignature, Landmark, MapPin, X } from 'lucide-react-native';
import { Button, Card, Eyebrow, Header, KText, Screen, Skeleton, Waypoint } from '@/components/k';
import { HostListingRow } from '@/components/k/host-bits';
import { color } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { useActiveFormHosingStore, useHostingRoomsStore } from '@/lib/stores/hostings';
import { useHostListingsQuery, useKycStatusQuery } from '@/lib/services/graphql/generated';

/** Start a new listing: identity check, what you'll need, how it works, and drafts to resume. */
export default function NewListing() {
	const { parent } = useLocalSearchParams<{ parent?: string }>();
	const me = useUserStore((s) => s.user.user?.id);
	// cache-and-network: KycStatus has no id, so the cache never learns a host just finished KYC.
	const [{ data: kycData, fetching, error }, refetchKyc] = useKycStatusQuery({ requestPolicy: 'cache-and-network' });
	const kyc = kycData?.kycStatus;
	const [{ data: mine }] = useHostListingsQuery({ variables: { filters: { creatorId: me }, pagination: { limit: 50, offset: 0 } }, pause: !me, requestPolicy: 'cache-and-network' });
	const drafts = (mine?.hostings ?? []).filter((h) => (h.publishStatus ?? 'DRAFT') === 'DRAFT' && h.kind !== 'CHILD').slice(0, 3);

	// This entry point never carries a listing id: anything left in the form store belongs to another listing.
	useEffect(() => {
		useActiveFormHosingStore.getState().clear();
		useHostingRoomsStore.getState().setRooms([]);
	}, []);

	const start = () => router.replace((parent ? `/hostings/form/basics?parent=${parent}` : '/hostings/form/basics') as Href);

	return (
		<Screen
			width="form"
			header={<Header eyebrow="Hosting" title={parent ? 'Add a unit' : 'New listing'} />}
			refreshing={false}
			onRefresh={() => refetchKyc({ requestPolicy: 'network-only' })}
			contentStyle={{ paddingTop: 20 }}
			footer={<Button title={kyc?.kycComplete ? 'Start my listing' : 'Verify my identity'} size="lg" block disabled={!kyc && fetching} onPress={kyc?.kycComplete ? start : () => router.push('/kyc')} testID="listing-start" />}
		>
			<View style={{ gap: 8 }}>
				<KText v="display">{parent ? 'Add a unit to your property' : 'List your property on Kushi'}</KText>
				<KText v="lead">Listing is free. It takes about 15 minutes, and everything saves as a draft, so you can stop and come back.</KText>
			</View>

			{!kyc && fetching ? (
				<Skeleton style={{ height: 120 }} />
			) : !kyc ? (
				<Card tone="danger">
					<KText v="bodyStrong">We couldn’t check your identity status</KText>
					<KText v="small">{error ? 'Check your connection, then try again.' : 'Pull down to try again.'}</KText>
					<Button title="Try again" variant="ghost" size="sm" onPress={() => refetchKyc({ requestPolicy: 'network-only' })} style={{ alignSelf: 'flex-start' }} />
				</Card>
			) : !kyc.kycComplete ? (
				<Card tone="amber">
					<Eyebrow c="amber">Before you start</Eyebrow>
					<KText v="bodyStrong">Verify your identity first</KText>
					<KText v="small">Kushi checks every host so renters know who they are dealing with. It takes a few minutes and you only do it once.</KText>
					<View style={{ gap: 8 }}>
						<KycLine ok={kyc.bvnVerified} label="BVN" />
						<KycLine ok={kyc.ninVerified} label="NIN" />
						<KycLine ok={kyc.hasLiveness} label="Selfie check" />
					</View>
				</Card>
			) : (
				<Card tone="signal">
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<Check size={18} color={color.success} />
						<KText v="smallStrong">Your identity is verified. You’re ready to list.</KText>
					</View>
				</Card>
			)}

			{drafts.length && !parent ? (
				<View style={{ gap: 10 }}>
					<Eyebrow>Pick up where you left off</Eyebrow>
					{drafts.map((d, i) => (
						<HostListingRow key={d.id} l={d} testID={`draft-${i}`} />
					))}
				</View>
			) : null}

			<View style={{ gap: 12 }}>
				<Eyebrow>Have these ready</Eyebrow>
				<Need icon={<MapPin size={17} color={color.amber} />} title="Be at the property" body="Photos are taken with the Kushi camera and stamped with the location, so renters know they’re real." />
				<Need icon={<FileSignature size={17} color={color.amber} />} title="The owner’s details" body="If you’re letting it, you’ll confirm who owns it and that you’re allowed to let it, then sign the tenancy terms." />
				<Need icon={<Landmark size={17} color={color.amber} />} title="Your bank account" body="Rent is held safely by Kushi and paid out to this account." />
			</View>

			<View style={{ gap: 12 }}>
				<Eyebrow>How it works</Eyebrow>
				<Stage n="1" title="Set it up" body="Seven short steps. Each one saves as you go." />
				<Stage n="2" title="Publish" body="Once every step is done, publishing puts it in front of renters straight away." />
				<Stage n="3" title="Get verified" body="Optional but worth it: send documents for trust badges. Kushi reviews each request within 3–5 business days." last />
			</View>
			<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
				<Clock size={14} color={color.muted} />
				<KText v="xs">About 15 minutes in total.</KText>
			</View>
		</Screen>
	);
}

function KycLine({ ok, label }: { ok: boolean; label: string }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel={`${label}: ${ok ? 'done' : 'not done'}`}>
			{ok ? <Check size={16} color={color.success} /> : <X size={16} color={color.danger} />}
			<KText v="small" style={{ color: ok ? color.fg2 : color.fg }}>
				{label} {ok ? 'verified' : 'needed'}
			</KText>
		</View>
	);
}

function Need({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
	return (
		<View style={{ flexDirection: 'row', gap: 14 }}>
			<View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.amberSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
			<View style={{ flex: 1, gap: 2 }}>
				<KText v="smallStrong">{title}</KText>
				<KText v="xs">{body}</KText>
			</View>
		</View>
	);
}

function Stage({ n, title, body, last }: { n: string; title: string; body: string; last?: boolean }) {
	return (
		<View style={{ flexDirection: 'row', gap: 14 }}>
			<View style={{ alignItems: 'center', width: 20 }}>
				<View style={{ paddingTop: 5 }}>
					<Waypoint active />
				</View>
				{!last ? <View style={{ flex: 1, width: 1, backgroundColor: color.line2, marginTop: 6 }} /> : null}
			</View>
			<View style={{ flex: 1, gap: 2, paddingBottom: last ? 0 : 6 }}>
				<KText v="smallStrong">
					{n}. {title}
				</KText>
				<KText v="xs">{body}</KText>
			</View>
		</View>
	);
}
