import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import { RTCAudioSession } from '@daily-co/react-native-webrtc';
import { CallType } from '../services/graphql/generated';
import { EventEmitter } from '../utils/event-emitter';
import { isEndIntent, isRingIntent } from '../utils/call';
import { IncomingCall, callFromData, isCallEndedSync, markCallEnded, requestCallRoute } from './state';
import { sendCallSignal } from './signal';
import { callError, callLog } from './log';

/**
 * iOS calls: PushKit (VoIP push) + CallKit (react-native-callkeep).
 *
 * The native side (patches/react-native-voip-push-notification) now reports
 * every VoIP push to CallKit before JS even loads, which iOS requires; without
 * it iOS killed the app on cold-start calls and eventually stopped delivering
 * VoIP pushes. JS keeps the call details so CallKit's Answer/Decline can be
 * acted on, including the ones tapped while JS was still loading (CallKit
 * queues those as "didLoadWithEvents" — they used to be dropped, so answering
 * from the lock screen opened the app with nothing connected).
 */

const calls = new Map<string, IncomingCall>();
const answered = new Set<string>();

const key = (uuid: string) => uuid.toLowerCase();

function remember(data: Record<string, unknown> | undefined | null) {
  const call = callFromData(data ? { ...data, receivedAt: data.receivedAt ?? Date.now() } : null);
  if (call) calls.set(key(call.callId), call);
  return call;
}

/** A call push (VoIP or the FCM fallback). `fromJs`: JS must report it to CallKit itself. */
export function onIosCallPush(data: Record<string, any> | undefined | null, fromJs: boolean) {
  if (!data) return;
  if (isEndIntent(data.intent)) {
    const callId = typeof data.callId === 'string' ? data.callId : null;
    callLog(data.intent === 'cancel_call' ? 'remote.cancelled' : 'remote.declined', { callId });
    if (callId) {
      markCallEnded(callId, data.intent);
      calls.delete(key(callId));
      // Native already ended a VoIP-reported call; harmless if so.
      try {
        RNCallKeep.reportEndCallWithUUID(callId, 2);
      } catch {}
    }
    EventEmitter.emit('call_cancelled', callId);
    return;
  }
  if (!isRingIntent(data.intent)) return;
  const call = remember(data);
  if (!call) return;
  callLog('ring.callkit', { callId: call.callId, fromJs });
  if (isCallEndedSync(call.callId)) {
    // A repeat push for a call we already finished: take it down again.
    try {
      RNCallKeep.reportEndCallWithUUID(call.callId, 2);
    } catch {}
    return;
  }
  if (fromJs) {
    const name = call.caller || 'Kushi call';
    RNCallKeep.displayIncomingCall(call.callId, name, name, 'generic', call.kind === 'video');
  }
}

/** Did the user answer this call in CallKit's own UI? */
export function isCallKitAnswered(callId: string) {
  return answered.has(key(callId));
}

function onAnswer(callUUID: string) {
  const call = calls.get(key(callUUID));
  answered.add(key(callUUID));
  if (!call) {
    callError('callkit.answer.unknown', new Error('Answered a call with no details'), { callUUID });
    return;
  }
  callLog('callkit.answer', { callId: call.callId });
  requestCallRoute({ ...call, answer: true });
}

function onEnd(callUUID: string) {
  const call = calls.get(key(callUUID));
  const callId = call?.callId ?? callUUID;
  // Our own endCall after the call screen hangs up lands here too: ignore it.
  if (isCallEndedSync(callId)) return;
  if (answered.has(key(callUUID))) {
    callLog('callkit.hangup', { callId });
    markCallEnded(callId, 'hangup.callkit');
    EventEmitter.emit('call_hangup', callId);
    return;
  }
  callLog('callkit.decline', { callId });
  markCallEnded(callId, 'declined.callkit');
  EventEmitter.emit('call_cancelled', callId);
  if (call) {
    sendCallSignal({ chatId: call.chatId, callId: call.callId, callType: CallType.Decline, callKind: call.kind });
  }
}

function onAudioActivated() {
  // CallKit owns the audio session for an answered call; WebRTC must be told,
  // or the mic and speaker never start (one-way or silent audio).
  callLog('callkit.audio.activated');
  try {
    RTCAudioSession.audioSessionDidActivate();
  } catch (e) {
    callError('callkit.audio.activate', e);
  }
}

function onAudioDeactivated() {
  callLog('callkit.audio.deactivated');
  try {
    RTCAudioSession.audioSessionDidDeactivate();
  } catch {}
}

function onVoipEvent(name: string, data: any) {
  if (name === 'RNVoipPushRemoteNotificationsRegisteredEvent') EventEmitter.emit('voip_token', data);
  else if (name === 'RNVoipPushRemoteNotificationReceivedEvent') onIosCallPush(data, false);
}

function onCallKeepEvent(name: string, data: any) {
  switch (name) {
    case 'RNCallKeepDidDisplayIncomingCall':
      if (data?.payload) remember(data.payload);
      if (data?.error) callError('callkit.display', new Error(String(data.error)), { callUUID: data.callUUID });
      break;
    case 'RNCallKeepPerformAnswerCallAction':
      onAnswer(data.callUUID);
      break;
    case 'RNCallKeepPerformEndCallAction':
      onEnd(data.callUUID);
      break;
    case 'RNCallKeepDidActivateAudioSession':
      onAudioActivated();
      break;
    case 'RNCallKeepDidDeactivateAudioSession':
      onAudioDeactivated();
      break;
  }
}

export function setupIosCalls() {
  if (Platform.OS !== 'ios') return;

  RNCallKeep.setup({
    ios: {
      appName: 'Kushi',
      includesCallsInRecents: false,
      supportsVideo: true,
      maximumCallGroups: '1',
      maximumCallsPerCallGroup: '1',
    },
  } as any).catch((e: unknown) => callError('callkit.setup', e));
  RNCallKeep.setAvailable(true);

  // Events CallKit queued before JS was ready (a cold-start Answer lands here).
  RNCallKeep.addEventListener('didLoadWithEvents', (events: any[]) => {
    for (const e of events ?? []) onCallKeepEvent(e.name, e.data);
  });
  RNCallKeep.addEventListener('didDisplayIncomingCall', (data: any) =>
    onCallKeepEvent('RNCallKeepDidDisplayIncomingCall', data),
  );
  RNCallKeep.addEventListener('answerCall', ({ callUUID }) => onAnswer(callUUID));
  RNCallKeep.addEventListener('endCall', ({ callUUID }) => onEnd(callUUID));
  RNCallKeep.addEventListener('didActivateAudioSession', onAudioActivated);
  RNCallKeep.addEventListener('didDeactivateAudioSession', onAudioDeactivated);

  VoipPushNotification.addEventListener('notification', (notification: any) =>
    onIosCallPush(notification, false),
  );
  VoipPushNotification.addEventListener('didLoadWithEvents', (events: any[]) => {
    for (const e of events ?? []) onVoipEvent(e.name, e.data);
  });
  VoipPushNotification.addEventListener('register', (token: string) => {
    EventEmitter.emit('voip_token', token);
  });
  VoipPushNotification.registerVoipToken();
}
