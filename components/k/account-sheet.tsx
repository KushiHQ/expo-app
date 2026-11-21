/**
 * "Create account" sheet for signed-out Save / Message / Apply.
 * Opened with `askForAccount(...)` from lib/k/pending-action; mount
 * <AccountSheetHost /> once near the app root.
 */
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { color } from '@/lib/k/theme';
import { dropPendingAction, useAccountSheet, useSignedInBeforeFlag, type AccountIntent } from '@/lib/k/pending-action';
import { useUserStore } from '@/lib/stores/users';
import { Button } from './button';
import { Sheet } from './sheet';
import { KText } from './text';
import { SocialButtons } from './social-buttons';

const AFTER: Record<AccountIntent, string> = {
	save: 'this home is saved as soon as you’re in.',
	message: 'the chat opens as soon as you’re in.',
	apply: 'your application starts as soon as you’re in.'
};

export function AccountSheetHost() {
	const intent = useAccountSheet((s) => s.intent);
	const returning = useAccountSheet((s) => s.returning);
	const close = useAccountSheet((s) => s.close);
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	useSignedInBeforeFlag();

	// Google / Apple finish inside the sheet: startSession navigates, we just get out of the way.
	useEffect(() => {
		if (signedIn && intent) close();
	}, [signedIn, intent, close]);

	const dismiss = () => {
		dropPendingAction();
		close();
	};
	const go = (to: '/auth/sign-up' | '/auth/sign-in') => {
		close();
		router.push(to);
	};

	const signIn = returning ? (
		<Button title="Sign in" size="lg" block onPress={() => go('/auth/sign-in')} testID="account-sign-in" />
	) : (
		<Pressable onPress={() => go('/auth/sign-in')} style={{ alignSelf: 'center', padding: 8 }} testID="account-sign-in" accessibilityRole="button">
			<KText v="small">
				Have an account? <KText v="smallStrong" style={{ color: color.fg, textDecorationLine: 'underline', textDecorationColor: color.amber }}>Sign in</KText>
			</KText>
		</Pressable>
	);

	return (
		<Sheet open={!!intent} onClose={dismiss} eyebrow="Account" title="Create account">
			<View style={{ gap: 16 }} testID="account-sheet">
				<KText v="small">An account keeps your saved homes and lets you message hosts and apply. It’s free, and {AFTER[intent ?? 'save']}</KText>
				{returning ? signIn : null}
				<SocialButtons mode="signup" />
				<Button title="Continue with email" variant={returning ? 'ghost' : 'amber'} size="lg" block onPress={() => go('/auth/sign-up')} testID="account-email" />
				{returning ? null : signIn}
				<KText v="xs" center>
					By continuing you agree to Kushi’s Terms of Service and Privacy Policy.
				</KText>
			</View>
		</Sheet>
	);
}
