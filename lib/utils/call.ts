import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import notifee, {
  Event,
  AndroidImportance,
  AndroidCategory,
  EventType,
  AndroidVisibility,
} from '@notifee/react-native';
import { createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { CallNotification, type CallAction } from 'lock-screen-manager';
import { CallType } from '../services/graphql/generated';
import { Href } from 'expo-router';
import { isAppUpdateIntent, openAppStore } from './urls';
import { EventEmitter } from './event-emitter';
import {
  RING_WINDOW_MS,
  callFromData,
  canRing,
  isCallEnded,
  isRingFresh,
  markCallEnded,
  requestCallRoute,
  setLockScreenLaunch,
} from '../call/state';
import { sendCallSignal } from '../call/signal';
import { callError, callLog } from '../call/log';

const receiverRingtone = require('@/assets/audio/ringtone.mp3');

const RING_INTENTS = ['voice-call', 'video-call'];
const END_INTENTS = ['cancel_call', 'decline_call'];

export const isRingIntent = (intent: unknown) => RING_INTENTS.includes(String(intent));
export const isEndIntent = (intent: unknown) => END_INTENTS.includes(String(intent));

// ── Ringtone ────────────────────────────────────────────────────────────────
// One ringtone for the whole app (background push, ringing screen), so
// stopping it anywhere stops it everywhere. It also stops by itself when the
// ring window closes, so it can never loop on after a call is gone.

let ringtonePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let ringTimer: ReturnType<typeof setTimeout> | null = null;

export const isRinging = () => ringtonePlayer !== null;

export const playRingtone = async () => {
  if (ringtonePlayer) return;
  try {
    ringtonePlayer = createAudioPlayer(receiverRingtone);
    ringtonePlayer.loop = true;
    ringtonePlayer.volume = 1.0;
    ringtonePlayer.play();
    if (ringTimer) clearTimeout(ringTimer);
    ringTimer = setTimeout(() => {
      stopRingtone();
    }, RING_WINDOW_MS);
  } catch (e) {
    callError('ringtone.play', e);
  }
};

export const stopRingtone = async () => {
  if (ringTimer) {
    clearTimeout(ringTimer);
    ringTimer = null;
  }
  if (ringtonePlayer) {
    const p = ringtonePlayer;
    ringtonePlayer = null;
    try {
      p.pause();
      p.release();
    } catch {}
  }
};

/** Stop ringing and remove the incoming-call notification for this call. */
export async function clearRinging(chatId?: string | null) {
  await stopRingtone();
  if (!chatId) return;
  try {
    CallNotification?.cancel(chatId);
  } catch {}
  try {
    await notifee.cancelNotification(chatId);
  } catch {}
}

// ── Pushes ──────────────────────────────────────────────────────────────────

/**
 * The incoming-call notification through Notifee: only for a build without the
 * native call notification (an old dev client). Its buttons are plain text.
 */
async function showNotifeeCallNotification(data: any, receivedAt: number, channelId: string) {
  await notifee.displayNotification({
    id: data.chatId,
    title: data?.intent === 'voice-call' ? 'Incoming voice call' : 'Incoming video call',
    body: `From ${data.caller}`,
    data: { ...data, receivedAt: String(receivedAt) },
    android: {
      channelId,
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: { id: 'default', launchActivity: 'default' },
      fullScreenAction: { id: 'full_screen', launchActivity: 'default' },
      // A ringing call is a full-screen, high-priority call notification. It
      // doesn't need a foreground service (Google Play rejects one here).
      ongoing: true,
      // The ring window closes by itself: a missed call never sits in the
      // tray as a live "incoming call" that rings again on the next launch.
      timeoutAfter: RING_WINDOW_MS,
      // White Kushi mark (Android tints it); see lib/plugins/withNotificationIcon.js
      smallIcon: 'ic_notification',
      color: '#F59E0B',
      actions: [
        {
          title: '<b>Answer</b>',
          pressAction: { id: 'accept', launchActivity: 'default' },
        },
        {
          title: '<font color="#D32F2F"><b>Decline</b></font>',
          pressAction: { id: 'reject' },
        },
      ],
    },
    ios: {
      categoryId: 'incoming-call',
      foregroundPresentationOptions: {
        alert: true,
        sound: true,
        badge: true,
      },
      attachments: [],
      sound: 'ringtone.mp3',
      critical: true,
    },
  });
}

/** Android: a call push (ring, cancel or decline) arrived. */
export const handleIncomingCall = async (remoteMessage: any) => {
  const data = remoteMessage?.data;
  if (isRingIntent(data?.intent)) {
    const receivedAt = Date.now();
    const call = callFromData({ ...data, receivedAt });
    if (!call) return;
    if (!(await canRing(call))) {
      callLog('ring.ignored', { callId: call.callId, reason: 'ended' });
      return;
    }
    callLog('ring.notify', { callId: call.callId, chatId: call.chatId });

    const channelId = await notifee.createChannel({
      id: 'incoming-call-v3',
      name: 'Incoming Calls',
      importance: AndroidImportance.HIGH,
      vibration: true,
      visibility: AndroidVisibility.PUBLIC,
    });

    if (CallNotification) {
      // Android's own call notification, drawn natively: full Answer and
      // Decline buttons on the banner, in the shade and on the lock screen.
      // Taps come back through drainCallActions, not Notifee's events.
      const shown: Record<string, string> = { receivedAt: String(receivedAt) };
      for (const [key, value] of Object.entries(data ?? {})) {
        if (typeof value === 'string') shown[key] = value;
      }
      CallNotification.show({
        chatId: call.chatId,
        caller: call.caller,
        kind: call.kind,
        timeoutMs: RING_WINDOW_MS,
        data: shown,
      });
    } else {
      await showNotifeeCallNotification(data, receivedAt, channelId);
    }

    await playRingtone();
  } else if (isEndIntent(data?.intent)) {
    callLog(data.intent === 'cancel_call' ? 'remote.cancelled' : 'remote.declined', { callId: data.callId });
    markCallEnded(data.callId, data.intent);
    await clearRinging(data.chatId);
    EventEmitter.emit('call_cancelled', data.callId);
  }
};

// ── Notification taps ───────────────────────────────────────────────────────

/**
 * A tap on an incoming-call notification: Answer, Decline, the body, or the
 * full-screen intent. The same handler runs for foreground, background and
 * cold-start events; the call state dedupes repeats.
 */
export async function handleCallNotificationPress(pressId: string | undefined, data: any) {
  const call = callFromData(data);
  if (!call || !isRingIntent(data?.intent)) return false;

  if (pressId === 'reject') {
    callLog('tap.decline', { callId: call.callId });
    markCallEnded(call.callId, 'declined');
    await clearRinging(call.chatId);
    // Tell the caller now, so they aren't left ringing for 45 s. No screen needed.
    await sendCallSignal({
      chatId: call.chatId,
      callId: call.callId,
      callType: CallType.Decline,
      callKind: call.kind,
    });
    return true;
  }

  if (pressId === 'accept') {
    // Answer always reaches the app. If the call is already over (the caller
    // hung up, or the ring ran out) the app says so; it is never dropped here,
    // which used to leave the user on a plain screen with the ringing stopped.
    const over = (await isCallEnded(call.callId)) || !isRingFresh(call.at);
    callLog('tap.answer', { callId: call.callId, over });
    if (over) markCallEnded(call.callId, 'answered too late');
    requestCallRoute({ ...call, answer: true });
    await clearRinging(call.chatId);
    return true;
  }

  if (!(await canRing(call))) {
    callLog('tap.stale', { callId: call.callId, pressId });
    await clearRinging(call.chatId);
    return true;
  }

  // Body tap or full-screen intent: show the ringing screen (it keeps ringing).
  callLog('tap.open', { callId: call.callId, pressId });
  requestCallRoute({ ...call, answer: false });
  return true;
}

// ── Android: the native call notification ───────────────────────────────────

const NATIVE_PRESS: Record<CallAction['action'], string | undefined> = {
  answer: 'accept',
  decline: 'reject',
  open: 'default',
  full_screen: 'full_screen',
  dismiss: undefined,
};

/**
 * Pulls what the user did with the native call notification (Answer, Decline,
 * a tap, the lock-screen launch) and acts on it. Native keeps each action
 * until this asks, so it is safe, and intended, to call this often: when the
 * bundle loads, when the app mounts, when it comes to the foreground, and when
 * native says there is something new.
 */
export function drainCallActions() {
  if (!CallNotification) return;
  let actions: CallAction[] = [];
  try {
    actions = CallNotification.takeActions();
  } catch (e) {
    callError('native.actions', e);
  }
  for (const { id, action, data } of actions) {
    callLog('native.action', { action, callId: data?.callId });
    const finish = () => {
      try {
        CallNotification?.done(id);
      } catch {}
    };
    if (action === 'dismiss') {
      stopRingtone().finally(finish);
      continue;
    }
    if (action === 'full_screen') setLockScreenLaunch(true);
    handleCallNotificationPress(NATIVE_PRESS[action], data)
      .catch((e) => callError('native.action', e, { action }))
      .finally(finish);
  }
}

/** Calls whose native notification is still showing (Android). */
export function activeCallNotifications(): Record<string, string>[] {
  try {
    return CallNotification?.active() ?? [];
  } catch {
    return [];
  }
}

let nativeActionsStarted = false;

/** Android, once per bundle load (index.js): listen for call-notification taps. */
export function startCallActions() {
  if (Platform.OS !== 'android' || !CallNotification || nativeActionsStarted) return;
  nativeActionsStarted = true;
  try {
    CallNotification.addListener('onAction', drainCallActions);
  } catch (e) {
    callError('native.listen', e);
  }
  drainCallActions();
}

export const handleNotifeeEvent = async ({ type, detail }: Event) => {
  if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
    const { pressAction, notification } = detail;
    const data = notification?.data as any;

    // Chat message notification tap — route to the chat
    if (data?.intent === 'notification' && data?.chatId) {
      await Linking.openURL(`kushi://chats/${data.chatId}`);
      return;
    }

    // App-update notification tap — open the store
    if (isAppUpdateIntent(data?.intent)) {
      await openAppStore();
      return;
    }

    await handleCallNotificationPress(pressAction?.id, data);
  } else if (type === EventType.DISMISSED) {
    const data = detail.notification?.data as any;
    if (isRingIntent(data?.intent)) await stopRingtone();
  }
};

export function buildCallURL(chatId: string, callType: 'voice' | 'video', initiate = false) {
  let url: Href = `/chats/${chatId}/call/${callType}`;
  const uniqueCallId = Crypto.randomUUID();
  if (initiate) {
    url = `${url}?initiate=true&callId=${uniqueCallId}`;
  }

  return url;
}
