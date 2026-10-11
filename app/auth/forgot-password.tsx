import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, KText, Notice, OtpField, PasswordField } from '@/components/k';
import { AuthShell } from '@/components/k/auth-shell';
import { toast } from '@/lib/hooks/use-toast';
import { useCompletePasswordChangeMutation, useRequestPasswordChangeMutation, useResendPasswordChangeOtpMutation } from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

/** Reset on one screen: email → code + new password. */
export default function ForgotPassword() {
	const params = useLocalSearchParams<{ email?: string }>();
	const [step, setStep] = useState<'email' | 'reset'>('email');
	const [email, setEmail] = useState(params.email ?? '');
	const [code, setCode] = useState('');
	const [pw, setPw] = useState('');
	const [pw2, setPw2] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);
	const [{ fetching: sending }, request] = useRequestPasswordChangeMutation();
	const [, resend] = useResendPasswordChangeOtpMutation();
	const [{ fetching: saving }, complete] = useCompletePasswordChangeMutation();

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	async function send() {
		setError(null);
		const r = await request({ input: { email: email.trim() } });
		if (r.error) return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setStep('reset');
		setCooldown(45);
	}
	async function save() {
		setError(null);
		const r = await complete({ input: { email: email.trim(), otp: code, password1: pw, password2: pw2 } });
		if (r.error) return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		toast.show({ type: 'success', text1: 'Password updated', text2: 'Sign in with your new password.' });
		router.replace({ pathname: '/auth/sign-in', params: { email: email.trim() } });
	}

	if (step === 'email')
		return (
			<AuthShell eyebrow="Reset password" title="Forgot it? No wahala." sub="Enter the email on your account and we’ll send you a code.">
				{error ? <Notice tone="danger">{error}</Notice> : null}
				<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
				<Button title="Send code" size="lg" block loading={sending} disabled={!/.+@.+\..+/.test(email)} onPress={send} />
			</AuthShell>
		);

	const mismatch = pw2.length > 0 && pw !== pw2;
	return (
		<AuthShell eyebrow="Reset password" title="Choose a new password" sub={`Enter the code we sent to ${email}.`}>
			{error ? <Notice tone="danger">{error}</Notice> : null}
			<OtpField value={code} onChange={setCode} />
			<PasswordField label="New password" hint="At least 8 characters." value={pw} onChangeText={setPw} autoComplete="new-password" />
			<PasswordField label="Confirm new password" value={pw2} onChangeText={setPw2} error={mismatch ? 'Passwords don’t match.' : null} />
			<Button title="Update password" size="lg" block loading={saving} disabled={code.length !== 6 || pw.length < 8 || pw !== pw2} onPress={save} />
			<Pressable
				onPress={async () => {
					if (cooldown > 0) return;
					const r = await resend({ email: email.trim() });
					if (!r.error) setCooldown(45);
				}}
				style={{ alignSelf: 'center', padding: 8 }}
			>
				<KText v="small">{cooldown > 0 ? `Resend in ${cooldown}s` : 'Send a new code'}</KText>
			</Pressable>
		</AuthShell>
	);
}
