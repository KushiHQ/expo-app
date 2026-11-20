import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { FileSignature, IdCard, Landmark, MapPin } from 'lucide-react-native';
import { Button, Choice, Eyebrow, Header, KText, Screen } from '@/components/k';
import { HostListingRow } from '@/components/k/host-bits';
import { ROLES } from '@/components/k/listing-mandate';
import { Rewards } from '@/components/k/rewards';
import { color } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import { useActiveFormHosingStore, useHostingRoomsStore } from '@/lib/stores/hostings';
import { useListingIntent, type Whereabouts } from '@/lib/k/listing-intent';
import { HostingPropertyRelationship, useHostListingsQuery, useKycStatusQuery } from '@/lib/services/graphql/generated';

const PLACES: { value: Whereabouts; title: string; detail: string }[] = [
	{ value: 'here', title: 'At the property', detail: 'Start with photos. Each one is stamped with where it was taken.' },
	{ value: 'away', title: 'Somewhere else', detail: 'Start with the details and price. Take the photos when you’re there.' }
];

const OWNER_NEED: Record<HostingPropertyRelationship, string> = {
	[HostingPropertyRelationship.Landlord]: 'Your address, and three short declarations.',
	[HostingPropertyRelationship.Agent]: 'The owner’s full name, address and phone number. Kushi may call the owner.',
	[HostingPropertyRelationship.Subletter]: 'Your landlord’s name and address, and three short declarations.'
};

/**
 * Start a new listing. Two questions that change the flow (role, and whether the host is at the
 * property), what they'll need, and drafts to resume. No identity check here: hosts verify once,
 * later in set-up (Ownership, or Publish for listings without that step).
 */
export default function NewListing() {
	const { parent } = useLocalSearchParams<{ parent?: string }>();
	const me = useUserStore((s) => s.user.user?.id);
	const [{ data: kycData }] = useKycStatusQuery({ requestPolicy: 'cache-and-network' });
	const kycDone = !!kycData?.kycStatus?.kycComplete;
	const [{ data: mine }, refetch] = useHostListingsQuery({ variables: { filters: { creatorId: me }, pagination: { limit: 50, offset: 0 } }, pause: !me, requestPolicy: 'cache-and-network' });
	const drafts = (mine?.hostings ?? []).filter((h) => (h.publishStatus ?? 'DRAFT') === 'DRAFT' && h.kind !== 'CHILD').slice(0, 3);
	const [role, setRole] = useState<HostingPropertyRelationship | null>(null);
	const [where, setWhere] = useState<Whereabouts | null>(null);
	const [tried, setTried] = useState(false);

	// This entry point never carries a listing id: anything left in the form store belongs to another listing.
	useEffect(() => {
		useActiveFormHosingStore.getState().clear();
		useHostingRoomsStore.getState().setRooms([]);
	}, []);

	// A unit belongs to a property that has already answered these.
	const asks = !parent;
	const valid = !asks || (!!role && !!where);

	const start = () => {
		setTried(true);
		if (!valid) return;
		useListingIntent.getState().setPending(asks && role && where ? { role, where } : null);
		router.replace((parent ? `/hostings/form/basics?parent=${parent}` : '/hostings/form/basics') as Href);
	};

	return (
		<Screen
			width="form"
			header={<Header eyebrow="Hosting" title={parent ? 'Add a unit' : 'New listing'} />}
			refreshing={false}
			onRefresh={() => refetch({ requestPolicy: 'network-only' })}
			contentStyle={{ paddingTop: 20 }}
			footer={
				<View style={{ gap: 8 }}>
					{tried && !valid ? (
						<KText v="xs" c="danger" center>
							Choose your role and where you are.
						</KText>
					) : null}
					<Button title="Start listing" size="lg" block onPress={start} testID="listing-start" />
				</View>
			}
		>
			<KText v="lead">Listing is free. It takes about 15 minutes and saves as you go, so you can stop and come back.</KText>

			<Rewards />

			{/* A returning host usually wants a draft, not a new listing. */}
			{drafts.length && !parent ? (
				<View style={{ gap: 10 }}>
					<Eyebrow>Drafts</Eyebrow>
					{drafts.map((d, i) => (
						<HostListingRow key={d.id} l={d} testID={`draft-${i}`} />
					))}
				</View>
			) : null}

			{asks ? (
				<View style={{ gap: 10 }}>
					<Eyebrow>Role</Eyebrow>
					{ROLES.map((r) => (
						<Choice key={r.value} title={r.title} detail={r.detail} on={role === r.value} onPress={() => setRole(r.value)} />
					))}
				</View>
			) : null}

			{asks ? (
				<View style={{ gap: 10 }}>
					<Eyebrow>Current location</Eyebrow>
					{PLACES.map((p) => (
						<Choice key={p.value} title={p.title} detail={p.detail} on={where === p.value} onPress={() => setWhere(p.value)} />
					))}
				</View>
			) : null}

			<View style={{ gap: 12 }}>
				<Eyebrow>Requirements</Eyebrow>
				<Need icon={<MapPin size={17} color={color.amber} />} title="On-site photos" body="Taken with the Kushi camera at the property." />
				<Need icon={<FileSignature size={17} color={color.amber} />} title="Owner details" body={role ? OWNER_NEED[role] : 'Who owns it, and that you’re allowed to let it.'} />
				<Need icon={<Landmark size={17} color={color.amber} />} title="Bank account" body="Rent is held by Kushi and paid out to this account." />
				{!kycDone ? <Need icon={<IdCard size={17} color={color.amber} />} title="Identity" body="Selfie, NIN and BVN, once, before your first listing goes live. About 3 minutes." /> : null}
			</View>
		</Screen>
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
