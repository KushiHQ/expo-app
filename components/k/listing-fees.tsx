/**
 * Fees on a listing: the host's own (agent fee, service charge, caution) with
 * an inline "Add fee" form, then Kushi's legal and platform fees (read-only).
 * Each fee saves on its own (saveHostingFee / deleteHostingFee).
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Pencil, Plus, Trash } from 'lucide-react-native';
import { Button, Card, Choice, IconButton, KText, Notice } from '@/components/k';
import { MoneyField, PickerSheet, SelectField } from '@/components/k/listing-form';
import { PayoutPicker } from '@/components/k/listing-payout';
import { color } from '@/lib/k/theme';
import { naira } from '@/lib/k/format';
import { toast } from '@/lib/hooks/use-toast';
import { cleanError } from '@/lib/k/use-listing-step';
import {
	FeeType,
	HostingPropertyRelationship,
	PaymentInterval,
	useDeleteHostingFeeMutation,
	useHostingFeeTypesQuery,
	useSaveHostingFeeMutation,
	type HostingQuery
} from '@/lib/services/graphql/generated';

type Fee = NonNullable<HostingQuery['hosting']['fees']>[number];

const PER: Partial<Record<PaymentInterval, string>> = {
	[PaymentInterval.Anually]: 'a year',
	[PaymentInterval.Monthly]: 'a month',
	[PaymentInterval.Weekly]: 'a week',
	[PaymentInterval.Nightly]: 'a night'
};

const mask = (n: string) => (n.length > 4 ? `•••• ${n.slice(-4)}` : n);

export function FeeList({
	hosting,
	interval,
	onChanged
}: {
	hosting?: HostingQuery['hosting'];
	interval?: PaymentInterval | null;
	/** Called with the listing's fees after a save or removal. */
	onChanged: (fees: Fee[]) => void;
}) {
	const [{ data: types }] = useHostingFeeTypesQuery({ requestPolicy: 'cache-first' });
	const [{ fetching: saving }, save] = useSaveHostingFeeMutation();
	const [, remove] = useDeleteHostingFeeMutation();
	const fees = hosting?.fees ?? [];
	const hostFees = fees.filter((f) => !f.setByKushi);
	const kushiFees = fees.filter((f) => f.setByKushi);
	const options = types?.hostingFeeTypes ?? [];
	const addable = options.filter((o) => !hostFees.some((f) => f.feeType === o.feeType));
	const isAgent = hosting?.verification?.propertyRelationship === HostingPropertyRelationship.Agent;
	const per = interval ? PER[interval] : undefined;

	const [form, setForm] = useState<{ feeType: FeeType | null; amount: string; account: string | null; isNew: boolean } | null>(null);
	const [pick, setPick] = useState(false);
	const [tried, setTried] = useState(false);
	const opt = options.find((o) => o.feeType === form?.feeType);

	const howOften = (t: FeeType, perPeriod: boolean) => (t === FeeType.AgentFee ? 'Once, on the first rent only' : perPeriod ? `Every rent period${per ? ` (${per})` : ''}` : 'Once');

	function edit(f?: Fee) {
		setTried(false);
		setForm(f ? { feeType: f.feeType, amount: String(Number(f.amount ?? 0) || ''), account: f.payoutAccount?.id ?? null, isNew: false } : { feeType: addable[0]?.feeType ?? null, amount: '', account: null, isNew: true });
	}

	async function submit() {
		setTried(true);
		if (!hosting?.id || !form?.feeType || !Number(form.amount)) return;
		if (opt?.needsPayoutAccount && !form.account) return;
		const r = await save({ input: { hostingId: hosting.id, feeType: form.feeType, amount: Number(form.amount), payoutAccountId: form.account } });
		if (r.error || !r.data) return toast.show({ type: 'error', text1: 'Couldn’t save the fee', text2: cleanError(r.error?.message) });
		onChanged(r.data.saveHostingFee);
		setForm(null);
		toast.show({ type: 'success', text2: 'Fee saved.' });
	}

	async function drop(f: Fee) {
		if (!hosting?.id) return;
		const r = await remove({ hostingId: hosting.id, feeType: f.feeType });
		if (r.error || !r.data) return toast.show({ type: 'error', text1: 'Couldn’t remove the fee', text2: cleanError(r.error?.message) });
		onChanged(r.data.deleteHostingFee);
		toast.show({ type: 'success', text2: `${f.label} removed.` });
	}

	return (
		<View style={{ gap: 10 }}>
			{hostFees.map((f) => (
				<Card key={f.feeType}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
						<View style={{ flex: 1, gap: 2 }}>
							<KText v="bodyStrong">{f.label}</KText>
							<KText v="xs">
								{howOften(f.feeType, f.perPeriod)}
								{f.payoutAccount ? ` · paid to ${f.payoutAccount.accountName ?? ''} ${mask(f.payoutAccount.accountNumber)}` : ''}
							</KText>
						</View>
						<KText v="bodyStrong">{naira(Number(f.amount ?? 0))}</KText>
						<IconButton label={`Change ${f.label}`} size={36} onPress={() => edit(f)}>
							<Pencil size={15} color={color.fg} />
						</IconButton>
						<IconButton label={`Remove ${f.label}`} size={36} onPress={() => drop(f)}>
							<Trash size={15} color={color.fg} />
						</IconButton>
					</View>
				</Card>
			))}

			{form ? (
				<Card>
					{form.isNew ? (
						<SelectField label="Fee" value={opt?.label} placeholder="Choose a fee" onPress={() => setPick(true)} />
					) : (
						<KText v="bodyStrong">{opt?.label}</KText>
					)}
					<MoneyField
						label="Amount"
						value={form.amount}
						onChange={(amount) => setForm((x) => (x ? { ...x, amount } : x))}
						hint={opt ? `${howOften(opt.feeType, opt.perPeriod)}.` : undefined}
						error={tried && !Number(form.amount) ? 'Enter an amount.' : null}
					/>
					{opt ? <KText v="xs">{opt.description}</KText> : null}
					{opt?.agentsOnly && !isAgent ? (
						<Notice tone="warn" title="Only for agents">
							In Verification, choose “I’m the owner’s agent” and add the owner’s phone number. Kushi calls the owner to confirm, and the listing can’t go live until that’s done.
						</Notice>
					) : null}
					{opt && (opt.needsPayoutAccount || opt.feeType === FeeType.ServiceCharge) ? (
						<View style={{ gap: 8 }}>
							<KText v="label">{opt.needsPayoutAccount ? 'Pay this fee to' : 'Pay this fee to (optional)'}</KText>
							{!opt.needsPayoutAccount ? <Choice title="With the rent" detail="Paid into the rent account" on={!form.account} onPress={() => setForm((x) => (x ? { ...x, account: null } : x))} /> : null}
							<PayoutPicker value={form.account} onChange={(account) => setForm((x) => (x ? { ...x, account } : x))} error={tried && opt.needsPayoutAccount && !form.account ? 'Choose the account for this fee.' : null} />
						</View>
					) : null}
					<View style={{ flexDirection: 'row', gap: 8 }}>
						<Button title="Save fee" loading={saving} onPress={submit} />
						<Button title="Cancel" variant="ghost" onPress={() => setForm(null)} />
					</View>
				</Card>
			) : addable.length ? (
				<Button title="Add fee" variant="ghost" size="sm" icon={<Plus size={15} color={color.fg} />} onPress={() => edit()} style={{ alignSelf: 'flex-start' }} testID="add-fee" />
			) : null}

			{kushiFees.map((f) => (
				<View key={f.feeType} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
					<KText v="small">
						{f.label} · set by Kushi{f.ratePercent != null ? ` · ${Number(f.ratePercent)}% of the rent, paid by the renter` : ''}
					</KText>
					{f.amount != null ? <KText v="small">{naira(Number(f.amount))}</KText> : null}
				</View>
			))}

			<PickerSheet
				open={pick}
				onClose={() => setPick(false)}
				title="Add a fee"
				options={addable.map((o) => ({ value: o.feeType, label: o.label, detail: o.description }))}
				value={form?.feeType ?? null}
				onPick={(o) => {
					setForm((x) => (x ? { ...x, feeType: o.value as FeeType, account: null } : x));
					setPick(false);
				}}
			/>
		</View>
	);
}
