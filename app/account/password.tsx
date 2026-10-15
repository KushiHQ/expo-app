import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Eyebrow, Header, KText, Notice, OtpField, PasswordField, Screen } from '@/components/k';
import { cleanError } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { useUserStore } from '@/lib/stores/users';
import { useCompletePasswordChangeMutation, useRequestPasswordChangeMutation, useResendPasswordChangeOtpMutation } from '@/lib/services/graphql/generated';

/**
 * Change password while signed in. The server confirms with an emailed code
 * (there is no "current password" check), so: send code → code + new password.
 */
export default function ChangePassword() {
	const email = useUserStore((s) => s.user.user?.email) ?? '';
	const [sent, setSent] = useState(false);
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
		const r = await request({ input: { email } });
		if (r.error) return setError(cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setSent(true);
		setCooldown(45);
	}
	async function again() {
		setError(null);
		const r = await resend({ email });
		if (r.error) return setError(cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setCooldown(45);
		toast.show({ type: 'info', text2: `New code sent to ${email}` });
	}
	async function save() {
		setError(null);
		const r = await complete({ input: { email, otp: code, password1: pw, password2: pw2 } });
		if (r.error) {
			const m = cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message);
			return setError(/otp|expired|invalid/i.test(m) ? 'That code is wrong or has expired. Send a new one and try again.' : m);
		}
		toast.show({ type: 'success', text1: 'Password changed', text2: 'Use it next time you sign in.' });
		router.back();
	}

	const short = pw.length > 0 && pw.length < 8;
	const mismatch = pw2.length > 0 && pw !== pw2;
	const ready = code.length === 6 && pw.length >= 8 && pw === pw2;

	return (
		<Screen
			header={<Header eyebrow="Security" title="Change password" />}
			width="form"
			keyboard
			footer={
				sent ? (
					<Button title="Save new password" size="lg" block loading={saving} disabled={!ready} onPress={save} testID="password-save" />
				) : (
					<Button title="Email me a code" size="lg" block loading={sending} disabled={!email} onPress={send} testID="password-send" />
				)
			}
		>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>{sent ? 'Step 2 of 2' : 'Step 1 of 2'}</Eyebrow>
				<KText v="title">{sent ? 'Enter the code and your new password' : 'First, confirm it’s you'}</KText>
				<KText v="small">
					{sent ? `We sent a 6-digit code to ${email}. It expires in a few minutes.` : `We’ll email a 6-digit code to ${email}. Signed up with Google or Apple? This sets a password as well.`}
				</KText>
			</View>
			{error ? <Notice tone="danger">{error}</Notice> : null}
			{sent ? (
				<>
					<View style={{ gap: 8 }}>
						<KText v="label">Code from your email</KText>
						<OtpField value={code} onChange={setCode} invalid={!!error && code.length === 0} />
					</View>
					<PasswordField label="New password" hint="At least 8 characters. A short phrase is easier to remember." error={short ? 'Use at least 8 characters.' : null} value={pw} onChangeText={setPw} autoComplete="new-password" textContentType="newPassword" testID="new-password" />
					<PasswordField label="Type it again" error={mismatch ? 'The passwords don’t match.' : null} value={pw2} onChangeText={setPw2} autoComplete="new-password" textContentType="newPassword" testID="new-password-2" />
					<Button title={cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'} variant="quiet" size="sm" disabled={cooldown > 0} onPress={again} />
				</>
			) : null}
		</Screen>
	);
}
