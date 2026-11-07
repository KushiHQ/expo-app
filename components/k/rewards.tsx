/**
 * Rewards running now: how close the person is, then a claim sheet once
 * they've reached the goal, then where their claim is. Renders nothing when
 * there are no rewards.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Gift, Landmark } from 'lucide-react-native';
import { Button, Card, Eyebrow, Field, KText, Notice, Row, Sheet, Spinner } from '@/components/k';
import { SelectField } from '@/components/k/listing-form';
import { color } from '@/lib/k/theme';
import { naira } from '@/lib/k/format';
import { toast } from '@/lib/hooks/use-toast';
import { cleanError } from '@/lib/k/use-listing-step';
import { useBanksQuery, useClaimRewardMutation, useMyRewardsQuery, useResolveBankAccountQuery, type MyRewardsQuery } from '@/lib/services/graphql/generated';

type Reward = MyRewardsQuery['myRewards'][number];

const LEVEL: Record<string, string> = { IDENTITY_VERIFIED: 'identity-verified', ADDRESS_VERIFIED: 'address-verified', TITLE_CHECKED: 'title-checked', KUSHI_VETTED: 'Kushi-vetted' };
const STATUS: Record<string, string> = {
	PENDING: 'Claimed. Kushi’s team is checking it.',
	APPROVED: 'Approved. The money is on its way.',
	PAID: 'Paid',
	PAYOUT_FAILED: 'We couldn’t send it. Our team will contact you.',
	REJECTED: 'Not approved.'
};
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function Rewards() {
	const [{ data }, refetch] = useMyRewardsQuery({ requestPolicy: 'cache-and-network' });
	const [claiming, setClaiming] = useState<Reward | null>(null);
	const rewards = data?.myRewards ?? [];
	if (!rewards.length) return null;
	return (
		<View style={{ gap: 12 }}>
			{rewards.map((r) => {
				const pct = Math.min(100, Math.round((r.progress / Math.max(1, r.targetCount)) * 100));
				const level = LEVEL[r.minTier] ?? '';
				return (
					<Card key={r.id} tone={r.canClaim || r.claim?.status === 'PAID' ? undefined : 'amber'}>
						<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
							<Gift size={18} color={color.amber} />
							<Eyebrow c="amber">Reward · {naira(Number(r.amount))}</Eyebrow>
						</View>
						<KText v="bodyStrong">{r.title}</KText>
						{r.claim ? (
							<>
								<KText v="small">
									{STATUS[r.claim.status]}
									{r.claim.status === 'REJECTED' && r.claim.note ? ` ${r.claim.note}` : ''}
								</KText>
								{r.claim.status !== 'REJECTED' ? (
									<KText v="xs">
										To {r.claim.accountName} ····{r.claim.accountLast4}
									</KText>
								) : null}
							</>
						) : r.canClaim ? (
							<>
								<KText v="small">
									You’ve published {r.progress} {level} listings. Claim your {naira(Number(r.amount))}.
								</KText>
								<Button title={`Claim ${naira(Number(r.amount))}`} onPress={() => setClaiming(r)} style={{ alignSelf: 'flex-start' }} testID="claim-reward" />
							</>
						) : (
							<>
								<KText v="small">
									Publish {r.targetCount} {level} listings to earn {naira(Number(r.amount))}. You have {r.progress} of {r.targetCount}.
								</KText>
								<View style={{ height: 8, borderRadius: 4, backgroundColor: color.line, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: r.targetCount, now: r.progress }}>
									<View style={{ width: `${pct}%`, height: '100%', backgroundColor: color.amber }} />
								</View>
								<KText v="xs">
									Listings created from {day(r.countsFrom)} count. A property with units counts once.
									{r.slotsLeft != null ? ` ${r.slotsLeft} reward${r.slotsLeft === 1 ? '' : 's'} left.` : ''}
									{r.endsAt ? ` Ends ${day(r.endsAt)}.` : ''}
								</KText>
							</>
						)}
					</Card>
				);
			})}
			<ClaimSheet
				reward={claiming}
				onClose={() => setClaiming(null)}
				onClaimed={() => {
					setClaiming(null);
					refetch({ requestPolicy: 'network-only' });
				}}
			/>
		</View>
	);
}

function ClaimSheet({ reward, onClose, onClaimed }: { reward: Reward | null; onClose: () => void; onClaimed: () => void }) {
	const open = !!reward;
	const [{ data: banks }] = useBanksQuery({ requestPolicy: 'cache-first', pause: !open });
	const [acct, setAcct] = useState('');
	const [bank, setBank] = useState<{ code: string; name: string } | null>(null);
	const [pick, setPick] = useState(false);
	const [q, setQ] = useState('');
	const list = (banks?.banks ?? []).filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()));
	const ready = acct.length === 10 && !!bank;
	const [{ data, fetching, error }] = useResolveBankAccountQuery({ variables: { input: { accountNumber: acct, bankCode: bank?.code ?? '' } }, pause: !ready, requestPolicy: 'network-only' });
	const name = ready ? data?.resolveBankAccount : null;
	const [{ fetching: saving }, claim] = useClaimRewardMutation();

	async function confirm() {
		if (!reward || !name || !bank) return;
		const r = await claim({ rewardId: reward.id, accountNumber: acct, bankCode: bank.code });
		if (r.error || !r.data) return toast.show({ type: 'error', text1: 'Couldn’t claim the reward', text2: cleanError(r.error?.message) });
		toast.show({ type: 'success', text2: 'Claimed. We’ll let you know when it’s paid.' });
		setAcct('');
		setBank(null);
		onClaimed();
	}

	return (
		<Sheet open={open} onClose={onClose} title="Claim your reward" eyebrow={reward ? naira(Number(reward.amount)) : undefined}>
			<KText v="small">The account must be in your own name. Kushi’s team checks the claim, then pays it.</KText>
			<SelectField label="Bank" value={bank?.name} placeholder="Choose your bank" onPress={() => setPick((v) => !v)} />
			{pick ? (
				<View style={{ gap: 8 }}>
					<Field placeholder="Search banks" value={q} onChangeText={setQ} autoCorrect={false} autoFocus />
					{list.slice(0, 40).map((b) => (
						<Row
							key={b.code}
							title={b.name}
							onPress={() => {
								setBank({ code: b.code, name: b.name });
								setPick(false);
								setQ('');
							}}
						/>
					))}
				</View>
			) : null}
			<Field label="Account number" value={acct} onChangeText={(t) => setAcct(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="10 digits" maxLength={10} prefix={<Landmark size={16} color={color.muted} />} />
			{ready ? (
				fetching ? (
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<Spinner />
						<KText v="small">Checking with {bank?.name}…</KText>
					</View>
				) : name ? (
					<Notice tone="success" title={name}>
						The reward goes to this name. It must be yours.
					</Notice>
				) : (
					<Notice tone="danger" title="We couldn’t find that account">
						{error ? cleanError(error.message) : 'Check the number and the bank.'}
					</Notice>
				)
			) : null}
			<Button title={reward ? `Claim ${naira(Number(reward.amount))}` : 'Claim'} block disabled={!name} loading={saving} onPress={confirm} />
		</Sheet>
	);
}
