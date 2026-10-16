import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Check, Eyebrow, Header, KText, Notice, Screen } from '@/components/k';
import { openLink } from '@/components/k/settings';
import { cleanError, LINKS } from '@/lib/k/account';
import { useDeleteAccountMutation } from '@/lib/services/graphql/generated';

const WHAT = [
	'Your account is closed and you can’t sign in to it again.',
	'Your listings are taken down and your chats are archived.',
	'Payment, booking and agreement records are kept, because Nigerian law and our escrow duties require it.'
];

/** Delete account — explains what happens before calling the server. */
export default function DeleteAccount() {
	const [sure, setSure] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, del] = useDeleteAccountMutation();

	async function go() {
		setError(null);
		const r = await del({});
		if (r.error || !r.data?.deleteAccount?.data) {
			const m = cleanError(r.error?.graphQLErrors[0]?.message ?? r.error?.message ?? r.data?.deleteAccount?.message);
			return setError(/active booking/i.test(m) ? 'You have a paid booking that hasn’t ended yet. Your account can be deleted once it ends — or contact support if you need help sooner.' : m || 'It didn’t go through. Try again, or email support.');
		}
		router.replace('/logout');
	}

	return (
		<Screen
			header={<Header eyebrow="Account" title="Delete account" />}
			width="form"
			footer={<Button title="Delete my account" variant="danger" size="lg" block loading={fetching} disabled={!sure} onPress={go} testID="delete-confirm" />}
		>
			<View style={{ gap: 8, paddingTop: 20 }}>
				<Eyebrow c="danger">This can’t be undone</Eyebrow>
				<KText v="title">Before you go</KText>
				<KText v="small">If something went wrong, tell us — we may be able to fix it. Deleting your account works like this:</KText>
			</View>
			<Card>
				{WHAT.map((t) => (
					<KText key={t} v="small" c="fg">
						• {t}
					</KText>
				))}
			</Card>
			<Notice tone="warn" title="Paid bookings">
				You can’t delete your account while you have a paid booking that hasn’t ended. Money held in escrow is still paid out or refunded as normal.
			</Notice>
			{error ? <Notice tone="danger" title="We couldn’t delete your account">{error}</Notice> : null}
			<Check on={sure} onPress={() => setSure((v) => !v)}>
				<KText v="small" c="fg">
					I understand my account will be closed and I won’t be able to sign in again.
				</KText>
			</Check>
			<View style={{ gap: 4 }}>
				<Button title="Talk to support first" variant="ghost" block onPress={() => router.push('/support')} />
				<Button title={`Or email ${LINKS.supportEmail}`} variant="quiet" size="sm" onPress={() => openLink(`mailto:${LINKS.supportEmail}?subject=Delete%20my%20Kushi%20account`)} />
			</View>
		</Screen>
	);
}
