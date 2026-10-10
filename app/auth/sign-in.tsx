import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, KText, Notice, PasswordField } from '@/components/k';
import { AuthShell } from '@/components/k/auth-shell';
import { OrDivider, SocialButtons } from '@/components/k/social-buttons';
import { color } from '@/lib/k/theme';
import { startSession } from '@/lib/k/session';
import { useLoginMutation } from '@/lib/services/graphql/generated';

const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export default function SignIn() {
	const params = useLocalSearchParams<{ email?: string }>();
	const [email, setEmail] = useState(params.email ?? '');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [unverified, setUnverified] = useState(false);
	const [{ fetching }, login] = useLoginMutation();

	async function submit() {
		if (!email.trim() || !password) return;
		setError(null);
		setUnverified(false);
		const r = await login({ input: { email: email.trim(), password } });
		const d = r.data?.login.data;
		if (d) return startSession(d);
		const msg = clean(r.error?.graphQLErrors[0]?.message ?? r.error?.message) || 'That email and password don’t match.';
		setError(msg);
		setUnverified(/verif/i.test(msg));
	}

	return (
		<AuthShell eyebrow="Welcome back" title="Sign in to Kushi" sub="Pick up your search, applications and messages.">
			<SocialButtons mode="login" />
			<OrDivider />
			{error ? (
				<Notice
					tone="danger"
					action={unverified ? 'Verify your email' : undefined}
					onAction={() => router.push({ pathname: '/auth/sign-up', params: { email, verify: '1' } })}
				>
					{error}
				</Notice>
			) : null}
			<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" testID="email" returnKeyType="next" />
			<View style={{ gap: 8 }}>
				<PasswordField label="Password" value={password} onChangeText={setPassword} autoComplete="password" textContentType="password" testID="password" returnKeyType="go" onSubmitEditing={submit} />
				<Pressable onPress={() => router.push({ pathname: '/auth/forgot-password', params: { email } })} style={{ alignSelf: 'flex-end' }}>
					<KText v="small" c="fg">
						Forgot your password?
					</KText>
				</Pressable>
			</View>
			<Button title="Sign in" size="lg" block loading={fetching} disabled={!email.trim() || !password} onPress={submit} testID="sign-in" />
			<Pressable onPress={() => router.replace('/auth/sign-up')} style={{ alignSelf: 'center', padding: 8 }}>
				<KText v="small">
					New to Kushi? <KText v="smallStrong" style={{ color: color.fg, textDecorationLine: 'underline', textDecorationColor: color.amber }}>Create an account</KText>
				</KText>
			</Pressable>
		</AuthShell>
	);
}
