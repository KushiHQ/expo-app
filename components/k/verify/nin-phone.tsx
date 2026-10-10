import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BadgeCheck, Plus } from 'lucide-react-native';
import { color, font, radius } from '@/lib/k/theme';
import { useUserStore } from '@/lib/stores/users';
import {
	useCompletePhoneNumberVerificationMutation,
	useInitiatePhoneNumberVerificationMutation,
	useMeQuery,
	useVerifyKycMutation,
	type Kyc,
	type User
} from '@/lib/services/graphql/generated';
import { Button } from '../button';
import { Field, OtpField } from '../form';
import { KText } from '../text';
import { Notice } from '../feedback';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

/** 11-digit NIN, matched by Kushi against the selfie. */
export function NinStep({ onDone, kind = 'nin' }: { onDone: () => void; kind?: 'nin' | 'bvn' }) {
	const [value, setValue] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, verify] = useVerifyKycMutation();
	async function go() {
		setError(null);
		const r = await verify({ input: kind === 'nin' ? { nin: value } : { bvn: value } });
		const k = r.data?.verifyKyc;
		const ok = kind === 'nin' ? k?.ninVerified : k?.bvnVerified;
		if (!ok) return setError(clean(r.error?.graphQLErrors[0]?.message ?? r.error?.message) || `We couldn’t match that ${kind.toUpperCase()} to your selfie. Check the number and try again.`);
		const st = useUserStore.getState();
		const u = st.user.user ?? ({} as User);
		st.updateUser({ user: { ...u, kyc: { ...(u.kyc ?? ({} as Kyc)), ninVerified: k?.ninVerified ?? u.kyc?.ninVerified, bvnVerified: k?.bvnVerified ?? u.kyc?.bvnVerified } } as typeof u });
		onDone();
	}
	return (
		<View style={{ gap: 14 }}>
			<Field
				label={kind === 'nin' ? 'National Identity Number (NIN)' : 'Bank Verification Number (BVN)'}
				hint={kind === 'nin' ? '11 digits. Dial *346# on your registered line if you don’t have it to hand.' : '11 digits. Dial *565*0# from your bank-registered line.'}
				value={value}
				onChangeText={(t) => setValue(t.replace(/\D/g, '').slice(0, 11))}
				keyboardType="number-pad"
				maxLength={11}
				style={{ fontFamily: font.mono, letterSpacing: 2 }}
				testID={kind}
			/>
			{error ? <Notice tone="danger">{error}</Notice> : null}
			<Button title={`Verify ${kind.toUpperCase()}`} size="lg" block loading={fetching} disabled={value.length !== 11} onPress={go} />
			<KText v="xs" center>
				Checked against the national database. Never shown to hosts.
			</KText>
		</View>
	);
}

const toE164 = (s: string) => {
	let d = s.replace(/\D/g, '');
	if (d.startsWith('234')) d = d.slice(3);
	return `+234${d.replace(/^0/, '')}`;
};
const pretty = (n: string) => n.replace(/^\+234(\d{3})(\d{3})(\d+)$/, '+234 $1 $2 $3');

/** Pick a verified phone number, or add one with an SMS code. `value` is E.164. */
export function PhoneStep({ value, onChange }: { value: string; onChange: (n: string) => void }) {
	const [{ data, fetching }, refetch] = useMeQuery({ requestPolicy: 'cache-and-network' });
	const verified = (data?.me?.phoneNumbers ?? []).filter((p) => p.verificationStatus === 'VERIFIED').map((p) => p.number);
	const [adding, setAdding] = useState(false);
	const [raw, setRaw] = useState('');
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [{ fetching: sending }, initiate] = useInitiatePhoneNumberVerificationMutation();
	const [{ fetching: confirming }, complete] = useCompletePhoneNumberVerificationMutation();
	const validNg = /^\+234[789][01]\d{8}$/.test(toE164(raw));

	useEffect(() => {
		if (!fetching && verified.length && !verified.includes(value)) onChange(verified[0]);
		if (!fetching && data && !verified.length) setAdding(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetching, data]);

	async function send() {
		setError(null);
		const n = toE164(raw);
		const r = await initiate({ phoneNumber: n });
		if (r.error) return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setSentTo(n);
	}
	async function confirm(otp = code) {
		if (!sentTo || otp.length !== 6) return;
		setError(null);
		const r = await complete({ input: { phoneNumber: sentTo, otp } });
		if (r.error) {
			setCode('');
			return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		}
		onChange(sentTo);
		setAdding(false);
		setSentTo(null);
		setRaw('');
		setCode('');
		refetch({ requestPolicy: 'network-only' });
	}

	return (
		<View style={{ gap: 10 }}>
			{verified.map((n) => (
				<Pressable key={n} onPress={() => onChange(n)} style={[s.opt, value === n && s.on]} accessibilityRole="radio" accessibilityState={{ checked: value === n }}>
					<View style={[s.dot, value === n && { borderColor: color.amber }]}>{value === n ? <View style={s.dotIn} /> : null}</View>
					<KText v="bodyStrong" style={{ flex: 1, fontFamily: font.monoMedium, letterSpacing: 0.5 }}>
						{pretty(n)}
					</KText>
					<BadgeCheck size={16} color={color.success} />
				</Pressable>
			))}
			{!adding && verified.length ? (
				<Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
					<Plus size={15} color={color.fg2} />
					<KText v="small">Use another number</KText>
				</Pressable>
			) : null}
			{adding ? (
				<View style={s.add}>
					{error ? <Notice tone="danger">{error}</Notice> : null}
					{!sentTo ? (
						<>
							<Field
								label="Phone number"
								value={raw}
								onChangeText={setRaw}
								keyboardType="phone-pad"
								autoComplete="tel"
								placeholder="0801 234 5678"
								prefix={<KText v="smallStrong" style={{ fontFamily: font.mono }}>🇳🇬 +234</KText>}
							/>
							<Button title="Send code" loading={sending} disabled={!validNg} onPress={send} />
							<KText v="xs">Your host sees this number only after you’ve paid.</KText>
						</>
					) : (
						<>
							<KText v="small">
								Enter the code sent to <KText v="smallStrong">{pretty(sentTo)}</KText>
							</KText>
							<OtpField value={code} onChange={setCode} onComplete={confirm} invalid={!!error} />
							<View style={{ flexDirection: 'row', gap: 10 }}>
								<Button title="Change number" variant="ghost" size="sm" onPress={() => (setSentTo(null), setCode(''))} />
								<Button title="Confirm" size="sm" loading={confirming} disabled={code.length !== 6} onPress={() => confirm()} style={{ flex: 1 }} />
							</View>
						</>
					)}
				</View>
			) : null}
		</View>
	);
}

const s = StyleSheet.create({
	opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line2, backgroundColor: color.bg2 },
	on: { borderColor: color.amber, backgroundColor: 'rgba(245,158,11,0.06)' },
	dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: color.line2, alignItems: 'center', justifyContent: 'center' },
	dotIn: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.amber },
	add: { gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, backgroundColor: color.bg2 }
});
