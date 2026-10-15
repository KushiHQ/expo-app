/**
 * Choose the phone number renters see for a listing, from the host's verified
 * numbers, or add and verify a new one by SMS code.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Phone, Plus } from 'lucide-react-native';
import { Button, Choice, Field, KText, OtpField, Sheet, Skeleton } from '@/components/k';
import { color, font } from '@/lib/k/theme';
import { toast } from '@/lib/hooks/use-toast';
import { cleanError } from '@/lib/k/use-listing-step';
import { PhoneNumberVerificationStatus, useCompletePhoneNumberVerificationMutation, useInitiatePhoneNumberVerificationMutation, useUserPhoneNumersQuery } from '@/lib/services/graphql/generated';

/** "08031234567" / "8031234567" / "+2348031234567" → "+2348031234567" */
export function toE164(raw: string): string {
	const d = raw.replace(/[^\d+]/g, '');
	if (d.startsWith('+')) return d;
	if (d.startsWith('234')) return `+${d}`;
	return `+234${d.replace(/^0/, '')}`;
}

export function ContactPicker({ value, onChange, error }: { value?: string | null; onChange: (number: string) => void; error?: string | null }) {
	const [{ data, fetching }, refetch] = useUserPhoneNumersQuery({ requestPolicy: 'cache-and-network' });
	const numbers = (data?.me.phoneNumbers ?? []).filter((n) => n.verificationStatus === PhoneNumberVerificationStatus.Verified);
	const [adding, setAdding] = useState(false);
	// A contact saved earlier that isn't in the verified list still shows, so it isn't silently dropped.
	const extra = value && !numbers.some((n) => n.number === value) ? value : null;

	return (
		<View style={{ gap: 10 }}>
			{fetching && !data ? <Skeleton style={{ height: 52 }} /> : null}
			{extra ? <Choice title={extra} detail="Saved on this listing" on onPress={() => onChange(extra)} /> : null}
			{numbers.map((n) => (
				<Choice key={n.id} title={n.number} detail="Verified" on={n.number === value} onPress={() => onChange(n.number)} />
			))}
			{data && !numbers.length && !extra ? <KText v="small">You haven’t verified a phone number yet. Add the one renters should call.</KText> : null}
			<Button title="Add a number" variant="ghost" size="sm" icon={<Plus size={15} color={color.fg} />} onPress={() => setAdding(true)} style={{ alignSelf: 'flex-start' }} />
			{error ? (
				<KText v="xs" c="danger">
					{error}
				</KText>
			) : null}
			<AddNumber
				open={adding}
				onClose={() => setAdding(false)}
				onAdded={(n) => {
					setAdding(false);
					refetch({ requestPolicy: 'network-only' });
					onChange(n);
				}}
			/>
		</View>
	);
}

function AddNumber({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (n: string) => void }) {
	const [raw, setRaw] = useState('');
	const [sent, setSent] = useState<string | null>(null);
	const [code, setCode] = useState('');
	const [err, setErr] = useState<string | null>(null);
	const [{ fetching: sending }, initiate] = useInitiatePhoneNumberVerificationMutation();
	const [{ fetching: checking }, complete] = useCompletePhoneNumberVerificationMutation();
	const number = toE164(raw);
	const valid = /^\+234[789][01]\d{8}$/.test(number) || (/^\+\d{10,15}$/.test(number) && !number.startsWith('+234'));

	function reset() {
		setRaw('');
		setSent(null);
		setCode('');
		setErr(null);
	}

	async function send() {
		setErr(null);
		const r = await initiate({ phoneNumber: number });
		if (r.error) return setErr(cleanError(r.error.message));
		setSent(number);
	}

	async function verify(c = code) {
		if (!sent || c.length !== 6) return;
		setErr(null);
		const r = await complete({ input: { phoneNumber: sent, otp: c } });
		if (r.error || !r.data?.completePhoneNumberVerification) {
			setCode('');
			return setErr(cleanError(r.error?.message) || 'That code didn’t work.');
		}
		toast.show({ type: 'success', text2: `${sent} verified.` });
		const n = sent;
		reset();
		onAdded(n);
	}

	return (
		<Sheet
			open={open}
			onClose={() => {
				reset();
				onClose();
			}}
			title={sent ? 'Enter the code' : 'Add a phone number'}
		>
			{!sent ? (
				<>
					<Field label="Phone number" value={raw} onChangeText={setRaw} keyboardType="phone-pad" placeholder="0803 123 4567" autoFocus prefix={<Phone size={16} color={color.muted} />} error={raw.length > 6 && !valid ? 'Enter a full Nigerian mobile number, like 0803 123 4567.' : err} hint="We’ll text a 6-digit code to confirm it’s yours." />
					<Button title="Send code" block loading={sending} disabled={!valid} onPress={send} />
				</>
			) : (
				<>
					<KText v="small">
						We sent a code to <KText style={{ fontFamily: font.bodySemi, color: color.fg }}>{sent}</KText>.
					</KText>
					<OtpField value={code} onChange={setCode} onComplete={verify} invalid={!!err} />
					{err ? (
						<KText v="small" c="danger" center>
							{err}
						</KText>
					) : null}
					<Button title="Verify" block loading={checking} disabled={code.length !== 6} onPress={() => verify()} />
					<Button title="Use a different number" variant="quiet" size="sm" onPress={reset} />
				</>
			)}
		</Sheet>
	);
}
