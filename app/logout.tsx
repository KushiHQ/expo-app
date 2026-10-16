import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { KText, Spinner } from '@/components/k';
import { color } from '@/lib/k/theme';
import { DEFAULT_SECURITY_SETTINGS, useSecuritySettingsStore } from '@/lib/stores/security-settings';
import { useActiveFormHosingStore, useHostingFilterStore, useHostingRoomsStore } from '@/lib/stores/hostings';
import { useUserStore } from '@/lib/stores/users';
import { clearAuthTokens } from '@/lib/utils/auth';
import { useLogoutMutation } from '@/lib/services/graphql/generated';

/** Ends the session on the server first (while the token is still attached), then wipes local state. */
export default function Logout() {
	const [, logout] = useLogoutMutation();

	useEffect(() => {
		let done = false;
		const wipe = async () => {
			if (done) return;
			done = true;
			useSecuritySettingsStore.getState().setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
			useUserStore.getState().reset();
			// Wipe any in-progress hosting draft so the next person doesn't see it.
			useActiveFormHosingStore.getState().clear();
			useHostingRoomsStore.getState().setRooms([]);
			useHostingFilterStore.getState().resetFilter();
			await clearAuthTokens();
			GoogleSignin.signOut().catch(() => {});
			if (router.canDismiss()) router.dismissAll();
			router.replace('/');
		};
		// Don't keep someone waiting on a slow network: give the server 4s.
		const timer = setTimeout(wipe, 4000);
		logout({})
			.catch(() => undefined)
			.finally(() => {
				clearTimeout(timer);
				wipe();
			});
		return () => clearTimeout(timer);
	}, [logout]);

	return (
		<View style={{ flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center', gap: 14 }} accessibilityLiveRegion="polite">
			<Spinner size="large" />
			<KText v="small">Signing you out…</KText>
		</View>
	);
}
