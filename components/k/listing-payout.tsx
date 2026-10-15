/**
 * Payout account for a listing: pick a saved account or add one. The account
 * name is looked up from the bank before saving so the host can confirm it.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Landmark, Plus } from 'lucide-react-native';
import { Button, Choice, Field, KText, Notice, Row, Sheet, Skeleton, Spinner } from '@/components/k';
import { SelectField } from '@/components/k/listing-form';
import { color } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { cleanError } from '@/lib/k/use-listing-step';
import { useBanksQuery, useCreateUpdateHostPaymentDetailsMutation, useHostPaymentDetailsQuery, useResolveBankAccountQuery } from '@/lib/services/graphql/generated';

const mask = (n: string) => (n.length > 4 ? `•••• ${n.slice(-4)}` : n);

export function PayoutPicker({ value, onChange, error }: { value?: string | null; onChange: (id: string) => void; error?: string | null }) {
	const [{ data, fetching }, refetch] = useHostPaymentDetailsQuery({ requestPolicy: 'cache-and-network' });
	const accounts = data?.hostPaymentDetails ?? [];
	const [adding, setAdding] = useState(false);
	return (
		<View style={{ gap: 10 }}>
			{fetching && !data ? <Skeleton style={{ height: 60 }} /> : null}
			{accounts.map((a) => (
				<Choice key={a.id} title={a.accountName || 'Account'} detail={`${a.bankDetails?.name ?? a.bankCode} · ${mask(a.accountNumber)}`} on={a.id === value} onPress={() => onChange(a.id)} />
			))}
			{data && !accounts.length ? <KText v="small">Add the account Kushi should pay your rent into.</KText> : null}
			<Button title="Add a bank account" variant="ghost" size="sm" icon={<Plus size={15} color={color.fg} />} onPress={() => setAdding(true)} style={{ alignSelf: 'flex-start' }} testID="add-bank" />
			{error ? (
				<KText v="xs" c="danger">
					{error}
				</KText>
			) : null}
			<AddAccount
				open={adding}
				onClose={() => setAdding(false)}
				onAdded={(id) => {
					setAdding(false);
					refetch({ requestPolicy: 'network-only' });
					onChange(id);
				}}
			/>
		</View>
	);
}

function AddAccount({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (id: string) => void }) {
	const [{ data: banks }] = useBanksQuery({ requestPolicy: 'cache-first', pause: !open });
	const [acct, setAcct] = useState('');
	const [bank, setBank] = useState<{ code: string; name: string } | null>(null);
	const [pick, setPick] = useState(false);
	const [q, setQ] = useState('');
	const list = (banks?.banks ?? []).filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()));
	const ready = acct.length === 10 && !!bank;
	const [{ data, fetching, error }] = useResolveBankAccountQuery({ variables: { input: { accountNumber: acct, bankCode: bank?.code ?? '' } }, pause: !ready, requestPolicy: 'network-only' });
	const name = ready ? data?.resolveBankAccount : null;
	const [{ fetching: saving }, save] = useCreateUpdateHostPaymentDetailsMutation();

	async function confirm() {
		if (!name || !bank) return;
		const r = await save({ input: { accountNumber: acct, accountName: name, bankCode: bank.code } });
		const id = r.data?.createUpdateHostPaymentDetails.data?.id;
		if (r.error || !id) return toast.show({ type: 'error', text1: 'Couldn’t add the account', text2: cleanError(r.error?.message) });
		toast.show({ type: 'success', text2: 'Bank account added.' });
		setAcct('');
		setBank(null);
		onAdded(id);
	}

	return (
		<Sheet open={open} onClose={onClose} title="Add a bank account">
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
			<Field label="Account number" value={acct} onChangeText={(t) => setAcct(t.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" placeholder="10 digits" maxLength={10} prefix={<Landmark size={16} color={color.muted} />} error={acct.length > 0 && acct.length < 10 ? `${10 - acct.length} more digit${acct.length === 9 ? '' : 's'}` : null} />
			{ready ? (
				fetching ? (
					<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
						<Spinner />
						<KText v="small">Checking with {bank?.name}…</KText>
					</View>
				) : name ? (
					<Notice tone="success" title={name}>
						Is this your account? Payouts go to this name.
					</Notice>
				) : (
					<Notice tone="danger" title="We couldn’t find that account">
						{error ? cleanError(error.message) : 'Check the number and the bank.'}
					</Notice>
				)
			) : null}
			<Button title="Yes, add this account" block disabled={!name} loading={saving} onPress={confirm} />
		</Sheet>
	);
}
