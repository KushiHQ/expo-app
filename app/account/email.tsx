import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from 'urql';
import { Button, Eyebrow, Field, Header, KText, Notice, OtpField, Screen } from '@/components/k';
import { cleanError, isPrivateRelay } from '@/lib/k/account';
import { toast } from '@/lib/hooks/use-toast';
import { useUserStore } from '@/lib/stores/users';
import { CONFIRM_EMAIL_CHANGE, REQUEST_EMAIL_CHANGE, type ConfirmEmailChangeResult } from '@/lib/services/graphql/requests/mutations/email-change';

/**
 * Change the account email: a code goes to the NEW address, and the switch
 * happens only once it's entered. Apple / Google sign-in keeps working after.
 */
export default function ChangeEmail() {
	const current = useUserStore((s) => s.user.user?.email) ?? '';
	const updateUser = useUserStore((s) => s.updateUser);
	const [email, setEmail] = useState('');
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);
	const [{ fetching: sending }, request] = useMutation(REQUEST_EMAIL_CHANGE);
	const [{ fetching: saving }, confirm] = useMutation<ConfirmEmailChangeResult>(CONFIRM_EMAIL_CHANGE);

	useEffect(() => {
		if (cooldown <= 0) return;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	const target = email.trim().toLowerCase();
	const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);

	async function send(to = target) {
		setError(null);
		const r = await request({ newEmail: to });
		if (r.error) return setError(cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message));
		setSentTo(to);
		setCode('');
		setCooldown(60);
	}

	async function save() {
		if (!sentTo) return;
		setError(null);
		const r = await confirm({ newEmail: sentTo, otp: code });
		if (r.error) {
			const m = cleanError(r.error.graphQLErrors[0]?.message ?? r.error.message);
			return setError(/invalid otp/i.test(m) ? 'That code is wrong. Check the email and try again.' : m);
		}
		const u = useUserStore.getState().user.user;
		const next = r.data?.confirmEmailChange;
		if (u && next) updateUser({ user: { ...u, email: next.email } });
		toast.show({ type: 'success', text1: 'Email changed', text2: `Kushi will now email ${sentTo}.` });
		router.back();
	}

	return (
		<Screen
			header={<Header eyebrow="Security" title="Change email" />}
			width="form"
			keyboard
			footer={
				sentTo ? (
					<Button title="Confirm new email" size="lg" block loading={saving} disabled={code.length !== 6} onPress={save} testID="email-confirm" />
				) : (
					<Button title="Send a code" size="lg" block loading={sending} disabled={!looksValid || target === current.toLowerCase()} onPress={() => send()} testID="email-send" />
				)
			}
		>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow>{sentTo ? 'Step 2 of 2' : 'Step 1 of 2'}</Eyebrow>
				<KText v="title">{sentTo ? 'Enter the code we sent' : 'Where should Kushi email you?'}</KText>
				<KText v="small">
					{sentTo
						? `We sent a 6-digit code to ${sentTo}. Your email changes once you enter it.`
						: `Right now it’s ${current || 'not set'}. We’ll send a code to the new address to make sure it’s yours. Google or Apple sign-in keeps working.`}
				</KText>
			</View>
			{!sentTo && isPrivateRelay(current) ? (
				<Notice tone="info" title="You signed up with Apple’s Hide My Email">
					Your current address is a private Apple relay. Use your real email if Kushi’s codes and updates aren’t reaching you.
				</Notice>
			) : null}
			{error ? <Notice tone="danger">{error}</Notice> : null}
			{sentTo ? (
				<>
					<View style={{ gap: 8 }}>
						<KText v="label">Code from {sentTo}</KText>
						<OtpField value={code} onChange={setCode} invalid={!!error && code.length === 0} />
					</View>
					<View style={{ flexDirection: 'row', gap: 10 }}>
						<Button title={cooldown > 0 ? `New code in ${cooldown}s` : 'Send a new code'} variant="quiet" size="sm" disabled={cooldown > 0 || sending} onPress={() => send(sentTo)} />
						<Button title="Use a different email" variant="quiet" size="sm" onPress={() => { setSentTo(null); setCode(''); setError(null); }} />
					</View>
				</>
			) : (
				<Field label="New email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" testID="new-email" />
			)}
		</Screen>
	);
}
