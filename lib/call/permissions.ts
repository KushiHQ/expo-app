import { Alert, Linking } from 'react-native';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { callError, callLog } from './log';

/**
 * Microphone access, asked for up front.
 *
 * An incoming call is often answered from the lock screen, where neither
 * Android nor iOS can show a permission prompt, so a phone that was never asked
 * joins with no microphone and the other person hears silence. We ask when
 * someone opens a conversation (before any call), and again before joining.
 */
export async function micGranted(): Promise<boolean> {
  try {
    return (await getRecordingPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Ask once, quietly, if the system can still ask. Never nags after a "no". */
export async function primeMicPermission() {
  try {
    const status = await getRecordingPermissionsAsync();
    if (status.granted || !status.canAskAgain) return;
    const res = await requestRecordingPermissionsAsync();
    callLog('mic.primed', { granted: res.granted });
  } catch (e) {
    callError('mic.prime', e);
  }
}

/**
 * Before joining a call: ask if we can, and if the microphone is off, say so
 * plainly with a way to fix it. Resolves with whether the mic is usable; the
 * call still connects either way, so the user can at least hear.
 */
export async function ensureMicForCall(): Promise<boolean> {
  try {
    let status = await getRecordingPermissionsAsync();
    if (!status.granted && status.canAskAgain) status = await requestRecordingPermissionsAsync();
    callLog('mic.check', { granted: status.granted, canAskAgain: status.canAskAgain });
    if (!status.granted) {
      Alert.alert(
        'Microphone is off',
        'The other person can’t hear you until Kushi can use your microphone. Turn it on in Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {}) },
        ],
      );
    }
    return status.granted;
  } catch (e) {
    callError('mic.check', e);
    return false;
  }
}
