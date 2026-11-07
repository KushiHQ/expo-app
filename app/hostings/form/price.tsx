import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Card, KText, KV, Segmented } from '@/components/k';
import { Block, MoneyField, StepScreen } from '@/components/k/listing-form';
import { PayoutPicker } from '@/components/k/listing-payout';
import { FeeList } from '@/components/k/listing-fees';
import { naira, perInterval } from '@/lib/k/format';
import { useListingStep } from '@/lib/k/use-listing-step';
import { showPayoutAccount } from '@/lib/constants/hosting/step-rules';
import { FeeType, HostingPropertyRelationship, ListingType, PaymentInterval } from '@/lib/services/graphql/generated';

const INTERVALS: { value: PaymentInterval; label: string; noun: string }[] = [
	{ value: PaymentInterval.Anually, label: 'Yearly', noun: 'year' },
	{ value: PaymentInterval.Monthly, label: 'Monthly', noun: 'month' },
	{ value: PaymentInterval.Weekly, label: 'Weekly', noun: 'week' },
	{ value: PaymentInterval.Nightly, label: 'Nightly', noun: 'night' }
];

/** Step 5 — price, optional fees and the payout account. */
export default function Price() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'price');
	const { input, updateInput, hosting } = f;
	const [tried, setTried] = useState(false);
	const [busy, setBusy] = useState(false);
	const sale = input.listingType === ListingType.Sale;
	const interval = (input.paymentInterval as PaymentInterval | undefined) ?? undefined;
	const noun = INTERVALS.find((i) => i.value === interval)?.noun ?? 'period';
	const payout = showPayoutAccount(input.managementType ?? hosting?.managementType);
	const price = Number(input.price) || 0;
	const id = hosting?.id;
	const feeOf = (t: FeeType) => Number(hosting?.fees?.find((x) => x.feeType === t)?.amount ?? 0) || 0;
	const agentFee = feeOf(FeeType.AgentFee);
	const serviceCharge = feeOf(FeeType.ServiceCharge);
	const caution = feeOf(FeeType.CautionFee);
	const isAgent = hosting?.verification?.propertyRelationship === HostingPropertyRelationship.Agent;

	const errors = {
		interval: !sale && !interval ? 'Choose how often rent is paid.' : null,
		price: !price ? (sale ? 'Enter the asking price.' : 'Enter the rent.') : null,
		payout: payout && !input.paymentDetailsId ? 'Choose or add the account Kushi pays you into.' : null
	};
	const valid = !errors.interval && !errors.price && !errors.payout;

	async function next() {
		setTried(true);
		if (!valid) return;
		setBusy(true);
		const id = await f.save();
		setBusy(false);
		if (id) f.advance(id);
	}

	return (
		<StepScreen
			stepKey="price"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			primary={{ title: 'Save and continue', onPress: next, loading: busy, testID: 'step-next' }}
			footnote={tried && !valid ? <KText v="xs" c="danger" center>{errors.interval ?? errors.price ?? errors.payout}</KText> : null}
		>
			{sale ? (
				<Block title="Asking price">
					<MoneyField label="Price" value={input.price} onChange={(v) => updateInput({ price: v || null })} error={tried ? errors.price : null} testID="field-price" />
				</Block>
			) : (
				<Block title="Rent" sub="Renters pay through Kushi; the agreement uses these figures.">
					<KText v="label">Paid</KText>
					<Segmented value={interval ?? ('' as PaymentInterval)} options={INTERVALS.map((i) => ({ value: i.value, label: i.label }))} onChange={(v) => updateInput({ paymentInterval: v })} />
					{tried && errors.interval ? (
						<KText v="xs" c="danger">
							{errors.interval}
						</KText>
					) : null}
					<MoneyField label={`Rent per ${noun}`} value={input.price} onChange={(v) => updateInput({ price: v || null })} error={tried ? errors.price : null} testID="field-price" />
					{price ? (
						<Card>
							<KText v="label">What renters see</KText>
							<KV k="Rent" v={`${naira(price)} ${perInterval(interval)}`} strong />
							{agentFee ? <KV k="First rent includes" v={`${naira(agentFee)} agent fee`} /> : null}
							{serviceCharge ? <KV k="Service charge" v={naira(serviceCharge)} /> : null}
							{caution ? <KV k="Caution deposit (refundable)" v={naira(caution)} /> : null}
							<KText v="xs">Kushi’s fees, legal fee and stamp duty are added on top for the renter.</KText>
						</Card>
					) : null}
				</Block>
			)}

			{!sale && payout ? (
				<Block title="Fees" sub="Anything the renter pays on top of the rent. Kushi’s own fees are added for you.">
					{id ? (
						<FeeList
							hosting={hosting}
							interval={interval}
							onChanged={(fees) => {
								// The agreement step reads these two to show their clauses.
								updateInput({
									cautionFee: fees.find((x) => x.feeType === FeeType.CautionFee)?.amount ?? null,
									serviceCharge: fees.find((x) => x.feeType === FeeType.ServiceCharge)?.amount ?? null
								});
								f.refetch();
							}}
						/>
					) : (
						<KText v="small">Save the rent first, then add fees.</KText>
					)}
				</Block>
			) : null}

			{payout ? (
				<Block
					title="Where the rent goes"
					sub={isAgent ? 'Rent is held until the renter moves in, then paid here. As the owner’s agent, use the owner’s account; your agent fee goes to its own account.' : 'Payment is held safely until the renter moves in, then paid here.'}
				>
					<PayoutPicker value={input.paymentDetailsId} onChange={(paymentDetailsId) => updateInput({ paymentDetailsId })} error={tried ? errors.payout : null} />
				</Block>
			) : null}
		</StepScreen>
	);
}
