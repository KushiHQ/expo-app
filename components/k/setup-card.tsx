import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Circle } from 'lucide-react-native';
import { Button } from './button';
import { Card } from './surface';
import { Eyebrow, KText } from './text';
import { Progress } from './listing-form';
import { color } from '@/lib/k/theme';
import { intentFor } from '@/lib/k/listing-intent';
import { stepHref, stepsFor, type Hosting, type StepKey } from '@/lib/k/listing-steps';
import { useHostingQuery, useKycStatusQuery } from '@/lib/services/graphql/generated';

/**
 * Today, until a host's first listing is live: what's done and one button for the next step,
 * instead of four tiles reading 0 and ₦0. Groups the seven listing steps into the five a new host
 * thinks in.
 */
export function SetupCard({ draftId }: { draftId?: string | null }) {
	const [{ data }] = useHostingQuery({ variables: { hostingId: draftId ?? '' }, pause: !draftId, requestPolicy: 'cache-and-network' });
	const [{ data: kycData }] = useKycStatusQuery({ requestPolicy: 'cache-and-network' });
	const h = (draftId ? data?.hosting : null) as Hosting | null | undefined;
	const kycDone = !!kycData?.kycStatus?.kycComplete;

	const steps = stepsFor(h);
	const state = (keys: StepKey[]) => {
		const own = steps.filter((s) => keys.includes(s.key));
		return { applies: own.length > 0, done: !!h && own.length > 0 && own.every((s) => s.done), first: own.find((s) => !s.done)?.key ?? null };
	};
	const details = state(['basics', 'location', 'features', 'price']);
	const owner = state(['agreement']);
	const photos = state(['photos']);
	const publish = state(['publish']);
	const rows = [
		{ label: 'Account', done: true, step: null as StepKey | null },
		{ label: 'Details and price', done: details.done, step: details.first },
		...(owner.applies ? [{ label: 'Ownership and agreement', done: owner.done, step: owner.first }] : []),
		{ label: 'Photos', done: photos.done, step: photos.first },
		{ label: kycDone ? 'Publish' : 'Identity and publish', done: false, step: publish.first ?? ('publish' as StepKey) }
	];
	const doneCount = rows.filter((r) => r.done).length;

	// Same order as the listing hub: a host who isn't at the property does photos last.
	const away = intentFor(h?.id)?.where === 'away';
	const next = rows.find((r) => !r.done && r.step && !(away && r.label === 'Photos')) ?? rows.find((r) => !r.done && r.step);
	const go = () => {
		if (!h) return router.push('/hostings/form');
		router.push(stepHref(next?.step ?? 'publish', h.id));
	};

	return (
		<Card tone="amber">
			<Eyebrow c="amber">Set-up</Eyebrow>
			<KText v="bodyStrong">{h ? h.title || 'Your listing' : 'Your first listing'}</KText>
			<KText v="small">
				{doneCount} of {rows.length} done
			</KText>
			{h ? <Progress steps={steps} inset /> : null}
			<View style={{ gap: 8 }}>
				{rows.map((r) => (
					<View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel={`${r.label}: ${r.done ? 'done' : 'not done'}`}>
						{r.done ? <Check size={16} color={color.success} /> : <Circle size={16} color={color.dim} />}
						<KText v="small" style={{ color: r.done ? color.fg2 : color.fg }}>
							{r.label}
						</KText>
					</View>
				))}
			</View>
			<Button
				title={h ? `Continue: ${(next?.label ?? 'Publish').toLowerCase()}` : 'Start listing'}
				onPress={go}
				style={{ alignSelf: 'flex-start' }}
				testID="setup-continue"
			/>
		</Card>
	);
}
