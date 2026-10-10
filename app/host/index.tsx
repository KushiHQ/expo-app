import { View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Building2, Inbox, Landmark, Plus, Wallet } from 'lucide-react-native';
import { ApplicationRow, DECIDABLE, HostListingRow } from '@/components/k/host-bits';
import { Button, Card, Empty, Eyebrow, IconButton, KText, Notice, Screen, Section, Skeleton } from '@/components/k';
import { color, font, radius } from '@/lib/k/theme';
import { naira } from '@/lib/k/format';
import { useUserStore } from '@/lib/stores/users';
import { BookingApplicationStatus as S, useHostAnalyticsQuery, useHostListingsQuery, useKBookingApplicationsQuery, useKycStatusQuery } from '@/lib/services/graphql/generated';

export default function Today() {
	const me = useUserStore((s) => s.user.user);
	const [{ data: an, fetching }, ra] = useHostAnalyticsQuery({ requestPolicy: 'cache-and-network' });
	const [{ data: ap }, rp] = useKBookingApplicationsQuery({ variables: { filter: { authHost: true, statuses: [S.Submited, S.SystemVerified, S.AdminVerified, S.HostVerified] }, pagination: { limit: 5, offset: 0 } }, requestPolicy: 'cache-and-network' });
	const [{ data: ls }, rl] = useHostListingsQuery({ variables: { filters: { creatorId: me?.id }, pagination: { limit: 6, offset: 0 } }, pause: !me?.id, requestPolicy: 'cache-and-network' });
	const [{ data: kyc }] = useKycStatusQuery({ requestPolicy: 'cache-and-network' });
	const a = an?.hostAnalytics;
	const pending = (ap?.bookingApplications ?? []).filter((x) => DECIDABLE.includes(x.status));
	const listings = ls?.hostings ?? [];
	const hour = new Date().getHours();
	const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const k = kyc?.kycStatus;
	const kycReady = k ? k.ninVerified && k.bvnVerified && k.hasLiveness : true;

	const stats = [
		{ icon: Inbox, k: 'Waiting for you', v: String(a?.pendingApplications ?? pending.length), sub: 'applications' },
		{ icon: Landmark, k: 'In escrow', v: naira(a?.fundsInEscrow ?? 0), sub: 'released at key handover' },
		{ icon: Wallet, k: 'Earned', v: naira(a?.totalRevenue ?? 0), sub: 'paid out through Kushi' },
		{ icon: Building2, k: 'Listings', v: String(a?.totalListings ?? listings.length), sub: 'on Kushi' }
	];

	return (
		<Screen tabbed onRefresh={() => (ra({ requestPolicy: 'network-only' }), rp({ requestPolicy: 'network-only' }), rl({ requestPolicy: 'network-only' }))} refreshing={false}>
			<View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: 12 }}>
				<View style={{ flex: 1, gap: 8 }}>
					<Eyebrow>Hosting</Eyebrow>
					<KText v="display">
						{greet}
						{me?.profile?.fullName ? `, ${me.profile.fullName.split(' ')[0]}` : ''}.
					</KText>
				</View>
				<IconButton label="Notifications" onPress={() => router.push('/notifications')}>
					<Bell size={18} color={color.fg} />
				</IconButton>
			</View>

			{!kycReady ? (
				<Notice tone="warn" title="Verify yourself to get listings verified" action="Verify now" onAction={() => router.push('/verify')}>
					Kushi needs your selfie, NIN and BVN before it can verify a property and pay you out.
				</Notice>
			) : null}

			<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
				{stats.map((s) => (
					<View key={s.k} style={{ width: '48%', flexGrow: 1, gap: 4, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 }}>
						<s.icon size={17} color={color.amber} />
						<KText v="micro">{s.k}</KText>
						{fetching && !a ? <Skeleton style={{ height: 22, width: '70%' }} /> : <KText style={{ fontFamily: font.display, fontSize: 21, letterSpacing: -0.8, color: color.fg }}>{s.v}</KText>}
						<KText v="xs">{s.sub}</KText>
					</View>
				))}
			</View>

			<Section title="Applications to review" action={pending.length ? <Button title="All" variant="quiet" size="sm" onPress={() => router.navigate('/host/applications')} /> : undefined}>
				{pending.length ? (
					pending.map((x) => <ApplicationRow key={x.id} a={x} />)
				) : (
					<Card>
						<KText v="small">Nothing waiting. Applications from verified renters will appear here.</KText>
					</Card>
				)}
			</Section>

			<Section title="Your listings" action={listings.length ? <Button title="Manage" variant="quiet" size="sm" onPress={() => router.navigate('/host/listings')} /> : undefined}>
				{listings.length ? (
					listings.map((l) => <HostListingRow key={l.id} l={l} />)
				) : (
					<Empty eyebrow="First listing" title="Put your property on the map" body="List it in minutes. Kushi verifies it, finds verified renters and handles the agreement and payment." action="Create a listing" onAction={() => router.push('/hostings/form')} />
				)}
			</Section>

			{listings.length ? <Button title="New listing" variant="ghost" icon={<Plus size={16} color={color.fg} />} onPress={() => router.push('/hostings/form')} /> : null}
		</Screen>
	);
}
