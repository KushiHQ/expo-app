import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { BadgeCheck, Check } from 'lucide-react-native';
import { Button, Card, Eyebrow, Header, KText, Notice, Screen, Skeleton } from '@/components/k';
import { PrivacyNote, StepRow, VerifyProgress, useRefreshOnFocus, useVerification } from '@/components/k/kyc';
import { color } from '@/lib/k/theme';

const UNLOCKS = {
	guest: ['Apply for any home on Kushi in minutes', 'Your verified name goes on your tenancy agreement', 'Hosts see a “verified renter” badge when you apply'],
	host: ['List properties and get the “ID verified” badge', 'Receive rent payouts released from escrow', 'Renters trust a verified host — you get more applications']
};

/** The one verification journey: what it unlocks, progress and each step. */
export default function VerifyHub() {
	const { next } = useLocalSearchParams<{ next?: string }>();
	const v = useVerification();
	useRefreshOnFocus(v.refresh);

	const open = (key: string) => router.push({ pathname: `/verify/${key}` as never, params: next ? { next } : {} });
	const finish = () => (next ? router.replace(next as Href) : router.canGoBack() ? router.back() : router.replace('/'));

	const footer = v.complete ? (
		<Button title={next ? 'Continue' : 'Done'} size="lg" block onPress={finish} testID="verify-done" />
	) : v.next ? (
		<Button title={v.doneCount ? `Continue: ${v.next.title.toLowerCase()}` : 'Start verification'} size="lg" block onPress={() => open(v.next!.blockedBy ? 'selfie' : v.next!.key)} testID="verify-continue" />
	) : null;

	return (
		<Screen header={<Header eyebrow="You" title="Verification" />} width="form" footer={footer} onRefresh={v.refresh} refreshing={false}>
			<View style={{ gap: 10, paddingTop: 20 }}>
				<Eyebrow c={v.complete ? 'success' : 'muted'}>{v.complete ? 'Verified' : 'About 3 minutes'}</Eyebrow>
				<KText v="display">{v.complete ? 'You’re verified.' : v.host ? 'Verify once, then list with confidence.' : 'Verify once, then apply anywhere.'}</KText>
				<KText v="small">
					{v.complete
						? 'Everything Kushi needs is done. You can update your phone number here any time.'
						: 'Kushi checks every renter and host once. It keeps scammers out and puts your verified name on agreements.'}
				</KText>
			</View>

			{v.loading ? <Skeleton style={{ height: 22 }} /> : <VerifyProgress done={v.doneCount} total={v.requiredCount} />}
			{v.error ? <Notice tone="warn" title="Showing your last known status">{`We couldn’t refresh it just now (${v.error}). Pull down to try again.`}</Notice> : null}

			{!v.complete ? (
				<Card>
					<KText v="heading">What this unlocks</KText>
					{(v.host ? UNLOCKS.host : UNLOCKS.guest).map((t) => (
						<View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
							<Check size={16} color={color.amber} style={{ marginTop: 2 }} />
							<KText v="small" c="fg" style={{ flex: 1 }}>
								{t}
							</KText>
						</View>
					))}
				</Card>
			) : (
				<Card>
					<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
						<BadgeCheck size={22} color={color.success} />
						<KText v="small" c="fg" style={{ flex: 1 }}>
							{v.host ? 'Your listings can show the “ID verified” badge and payouts can be released to you.' : 'Hosts see a verified-renter badge on your applications.'}
						</KText>
					</View>
				</Card>
			)}

			<View style={{ gap: 10 }}>
				<Eyebrow>Steps</Eyebrow>
				{v.loading
					? [0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 74 }} />)
					: v.steps.map((s, i) => <StepRow key={s.key} step={s} index={i} onPress={() => open(s.blockedBy && !s.done ? 'selfie' : s.key)} />)}
			</View>

			<PrivacyNote />
		</Screen>
	);
}
