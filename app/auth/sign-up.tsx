/**
 * Create an account → enter the emailed code on the same screen → signed in.
 * (No separate verify/sign-in screens to bounce between.)
 */
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Check, Field, KText, Notice, OtpField, PasswordField } from '@/components/k';
import { AuthShell } from '@/components/k/auth-shell';
import { OrDivider, SocialButtons } from '@/components/k/social-buttons';
import { color } from '@/lib/k/theme';
import { startSession } from '@/lib/k/session';
import { useLoginMutation, useResendEmailVerificationOtpMutation, useSignUpMutation, useVerifyEmailMutation } from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export default function SignUp() {
	const params = useLocalSearchParams<{ email?: string; verify?: string }>();
	const [step, setStep] = useState<'details' | 'code'>(params.verify ? 'code' : 'details');
	const [name, setName] = useState('');
	const [email, setEmail] = useState(params.email ?? '');
	const [password, setPassword] = useState('');
	const [agreed, setAgreed] = useState(false);
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);
	const [{ fetching: creating }, signUp] = useSignUpMutation();
	const [{ fetching: verifying }, verify] = useVerifyEmailMutation();
	const [, resend] = useResendEmailVerificationOtpMutation();
	const [{ fetching: loggingIn }, login] = useLoginMutation();

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	const strength = [password.length >= 8, password.length >= 12, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password) && /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
	const valid = name.trim().split(/\s+/).length >= 2 && /.+@.+\..+/.test(email.trim()) && password.length >= 8 && agreed;

	async function create() {
		setError(null);
		const r = await signUp({ input: { fullName: name.trim(), email: email.trim(), password } });
		if (r.error) return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setStep('code');
		setCooldown(45);
	}

	async function confirm(otp = code) {
		if (otp.length !== 6) return;
		setError(null);
		const r = await verify({ input: { email: email.trim(), otp } });
		if (r.error) {
			setCode('');
			return setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		}
		// Verified. If we still have the password from this session, sign straight in.
		if (password) {
			const l = await login({ input: { email: email.trim(), password } });
			if (l.data?.login.data) return startSession(l.data.login.data);
		}
		router.replace({ pathname: '/auth/sign-in', params: { email: email.trim() } });
	}

	async function again() {
		if (cooldown > 0) return;
		const r = await resend({ email: email.trim() });
		if (r.error) setError(clean(r.error.graphQLErrors[0]?.message ?? r.error.message));
		else setCooldown(45);
	}

	if (step === 'code')
		return (
			<AuthShell eyebrow="One last step" title="Check your email" sub={`Enter the 6-digit code we sent to ${email || 'your email'}.`}>
				{!params.email && !email ? <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /> : null}
				{error ? <Notice tone="danger">{error}</Notice> : null}
				<OtpField value={code} onChange={setCode} onComplete={confirm} invalid={!!error} />
				<Button title="Verify and continue" size="lg" block loading={verifying || loggingIn} disabled={code.length !== 6} onPress={() => confirm()} />
				<Pressable onPress={again} style={{ alignSelf: 'center', padding: 8 }}>
					<KText v="small">{cooldown > 0 ? `Resend a new code in ${cooldown}s` : 'Didn’t get it? Send a new code'}</KText>
				</Pressable>
				<Pressable onPress={() => setStep('details')} style={{ alignSelf: 'center', padding: 4 }}>
					<KText v="xs">Change details</KText>
				</Pressable>
			</AuthShell>
		);

	return (
		<AuthShell eyebrow="Join Kushi" title="Create your account" sub="Save homes, message hosts and apply in minutes. It’s free.">
			<SocialButtons mode="signup" />
			<OrDivider />
			{error ? <Notice tone="danger">{error}</Notice> : null}
			<Field label="Full name" hint="As it appears on your ID — it goes on your tenancy agreement." value={name} onChangeText={setName} autoComplete="name" textContentType="name" testID="name" />
			<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" testID="email" />
			<View style={{ gap: 8 }}>
				<PasswordField label="Password" value={password} onChangeText={setPassword} autoComplete="new-password" textContentType="newPassword" testID="password" />
				{password ? (
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
						{[1, 2, 3, 4].map((i) => (
							<View key={i} style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: strength >= i ? color.amber : color.line2 }} />
						))}
						<KText v="xs">{password.length < 8 ? 'At least 8 characters' : ['Okay', 'Okay', 'Good', 'Strong', 'Excellent'][strength]}</KText>
					</View>
				) : null}
			</View>
			<Check on={agreed} onPress={() => setAgreed((a) => !a)}>
				<KText v="small">I agree to Kushi’s Terms of Service and Privacy Policy.</KText>
			</Check>
			<Button title="Create account" size="lg" block loading={creating} disabled={!valid} onPress={create} testID="sign-up" />
			<Pressable onPress={() => router.replace('/auth/sign-in')} style={{ alignSelf: 'center', padding: 8 }}>
				<KText v="small">
					Already on Kushi? <KText v="smallStrong" style={{ color: color.fg, textDecorationLine: 'underline', textDecorationColor: color.amber }}>Sign in</KText>
				</KText>
			</Pressable>
		</AuthShell>
	);
}
