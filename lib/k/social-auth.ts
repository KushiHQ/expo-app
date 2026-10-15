/**
 * Continue with Google / Apple — one hook for both sign-in and sign-up.
 * Google: native SDK id token. Apple: native on iOS; on Android the web flow via
 * the Housing web app (housing.kushi.ng) which hands the identity token back to the app.
 */
import { useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAppleLoginMutation, useAppleSignUpMutation, useGoogleLoginMutation, useGoogleSignUpMutation } from '@/lib/services/graphql/generated';
import { startSession } from './session';

type Mode = 'login' | 'signup';
const clean = (m?: string) => (m ?? '').replace('[GraphQL] ', '');

export function useSocialAuth(mode: Mode) {
	const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [, googleLogin] = useGoogleLoginMutation();
	const [, googleSignUp] = useGoogleSignUpMutation();
	const [, appleLogin] = useAppleLoginMutation();
	const [, appleSignUp] = useAppleSignUpMutation();

	async function google() {
		setError(null);
		setBusy('google');
		try {
			if (Platform.OS === 'android') await GoogleSignin.hasPlayServices();
			const info = await GoogleSignin.signIn();
			const idToken = info.data?.idToken;
			if (!idToken) return;
			const r = mode === 'login' ? await googleLogin({ idToken }) : await googleSignUp({ idToken });
			const d = mode === 'login' ? (r.data as { googleLogin?: { data?: Session } })?.googleLogin?.data : (r.data as { googleSignUp?: { data?: Session } })?.googleSignUp?.data;
			if (d) await startSession(d);
			else setError(clean(r.error?.graphQLErrors[0]?.message ?? r.error?.message) || 'Google sign-in did not complete.');
		} catch {
			/* cancelled */
		} finally {
			setBusy(null);
		}
	}

	async function apple() {
		setError(null);
		setBusy('apple');
		try {
			let identityToken: string | null = null;
			let fullName: string | undefined;
			if (Platform.OS === 'ios') {
				const c = await AppleAuthentication.signInAsync({
					requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL]
				});
				identityToken = c.identityToken;
				if (c.fullName?.givenName) fullName = `${c.fullName.givenName} ${c.fullName.familyName ?? ''}`.trim();
			} else {
				const redirectUri = Linking.createURL('/auth/sign-in');
				const res = await WebBrowser.openAuthSessionAsync(`https://housing.kushi.ng/api/auth/apple/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`, redirectUri, {
					preferEphemeralSession: true
				});
				if (res.type === 'success') {
					const p = new URL(res.url).searchParams;
					identityToken = p.get('identityToken');
					fullName = p.get('fullName') ?? undefined;
				}
			}
			if (!identityToken) return;
			const input = { identityToken, fullName };
			const r = mode === 'login' ? await appleLogin({ input }) : await appleSignUp({ input });
			const d = mode === 'login' ? (r.data as { appleLogin?: { data?: Session } })?.appleLogin?.data : (r.data as { appleSignUp?: { data?: Session } })?.appleSignUp?.data;
			if (d) await startSession(d);
			else setError(clean(r.error?.graphQLErrors[0]?.message ?? r.error?.message) || 'Apple sign-in did not complete.');
		} catch {
			/* cancelled */
		} finally {
			setBusy(null);
		}
	}

	return { google, apple, busy, error };
}

type Session = Parameters<typeof startSession>[0];
