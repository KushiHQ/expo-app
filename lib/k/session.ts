/**
 * One place for "a session started": store tokens + profile, then continue to
 * wherever the person was going (returnUrl) or their home for the current mode.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import { saveAuthTokens } from '@/lib/utils/auth';
import { useUserStore } from '@/lib/stores/users';
import { UserType, type UserData } from '@/lib/types/users';

type AuthPayload = {
	token: string;
	refreshToken: string;
	expiresAt?: string | null;
	user: NonNullable<UserData['user']>;
};

export async function startSession(data: AuthPayload) {
	await saveAuthTokens({ access: data.token, refresh: data.refreshToken });
	const store = useUserStore.getState();
	store.updateUser({ tokenData: { expiresAt: data.expiresAt ?? undefined }, user: data.user, email: data.user.email });
	// Came in through "List a property": open in hosting mode, on New listing.
	const hosting = await takeHostIntent();
	if (hosting) store.updateUser({ userType: UserType.Host });
	const next = store.returnUrl;
	store.setReturnUrl(null);
	if (router.canDismiss()) router.dismissAll();
	if (hosting) {
		router.replace('/host');
		router.push('/hostings/form');
		return;
	}
	router.replace((next as Href) ?? homeFor(store.user.userType));
}

/**
 * "List a property" (welcome screen, or You while signed out) before an account exists. Kept on the
 * phone so it survives leaving the app to fetch the email code; used once by startSession, and only
 * for a couple of hours.
 */
const HOST_INTENT = 'k.host-intent.v1';
export const setHostIntent = (on: boolean) => (on ? AsyncStorage.setItem(HOST_INTENT, String(Date.now())) : AsyncStorage.removeItem(HOST_INTENT));
async function takeHostIntent() {
	const at = Number(await AsyncStorage.getItem(HOST_INTENT));
	if (at) await AsyncStorage.removeItem(HOST_INTENT);
	return !!at && Date.now() - at < 2 * 60 * 60 * 1000;
}

export function homeFor(mode?: UserType): Href {
	return mode === UserType.Host ? '/host' : '/';
}

/** Send a signed-out person to sign in, coming back here afterwards. */
export function requireSignIn(returnTo?: string) {
	useUserStore.getState().setReturnUrl(returnTo ?? null);
	router.push('/auth/sign-in');
}

export const isSignedIn = () => !!useUserStore.getState().user.user?.id;

const WELCOMED = 'k.welcomed.v1';
export const hasSeenWelcome = async () => (await AsyncStorage.getItem(WELCOMED)) === '1';
export const markWelcomed = () => AsyncStorage.setItem(WELCOMED, '1');
