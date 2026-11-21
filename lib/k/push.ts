/**
 * Push permission, asked in context instead of at launch.
 *
 * The phone's prompt is shown only from a "Turn on" button (chat after the first
 * message, Application sent, Listing published, You › Notifications). On
 * launch the app only checks: if notifications are already allowed it
 * registers the token as before; otherwise it waits.
 */
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { getMessaging, requestPermission, AuthorizationStatus as FcmStatus } from '@react-native-firebase/messaging';
import { EventEmitter } from '@/lib/utils/event-emitter';

export const PUSH_GRANTED = 'push_granted';

/** Notifications are allowed for Kushi on this phone. */
export async function pushAllowed(): Promise<boolean> {
	try {
		const s = await notifee.getNotificationSettings();
		return s.authorizationStatus === AuthorizationStatus.AUTHORIZED || s.authorizationStatus === AuthorizationStatus.PROVISIONAL;
	} catch {
		return false;
	}
}

/**
 * Ask the phone. Returns true when allowed. When the phone won't show its
 * prompt any more (refused before), opens Kushi's page in Settings instead.
 */
export async function askForNotifications(): Promise<boolean> {
	try {
		await notifee.requestPermission();
		const st = await requestPermission(getMessaging());
		const ok = st === FcmStatus.AUTHORIZED || st === FcmStatus.PROVISIONAL || (await pushAllowed());
		if (ok) {
			EventEmitter.emit(PUSH_GRANTED);
			return true;
		}
		Linking.openSettings().catch(() => {});
		return false;
	} catch {
		return false;
	}
}

/** Where a card was shown. Each place shows its card at most once per install (Listing published: every publish). */
type Place = 'chat' | 'applied';
const key = (p: Place) => `k.push.card.${p}.v1`;

/** True if the card for this place should show now, and records that it has. */
export async function takeCard(place: Place): Promise<boolean> {
	if (await pushAllowed()) return false;
	if ((await AsyncStorage.getItem(key(place))) === '1') return false;
	await AsyncStorage.setItem(key(place), '1');
	return true;
}
