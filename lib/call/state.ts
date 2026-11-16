import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from '../utils/event-emitter';
import { callLog } from './log';

/**
 * One source of truth for incoming calls, shared by every entry point: FCM
 * (foreground and background), Notifee taps (foreground, background, cold
 * start), CallKit/PushKit (iOS) and the call screen itself.
 *
 * - Ended calls are remembered (in memory and on disk), so a call that was
 *   declined, cancelled, answered elsewhere or hung up never rings again, even
 *   after the app is killed and reopened.
 * - A ring is only "fresh" inside the ring window. Anything older is stale and
 *   is cleared instead of shown.
 * - Answer/open requests made while the app has no navigator (killed or in the
 *   background) are parked and picked up as soon as the app can navigate.
 */

/** The caller rings for 45 s; allow a little clock skew and push latency. */
export const RING_WINDOW_MS = 50_000;

export type CallKind = 'voice' | 'video';

export type IncomingCall = {
  callId: string;
  chatId: string;
  kind: CallKind;
  caller?: string;
  /** When this device received the ring (ms since epoch, device clock). */
  at?: number;
};

export type CallRoute = IncomingCall & { answer: boolean };

const ENDED_KEY = 'kushi.call.ended';
const PENDING_KEY = 'kushi.call.pending';
const ENDED_TTL_MS = 24 * 60 * 60 * 1000;

const ended = new Map<string, number>();
let endedLoaded: Promise<void> | null = null;

function loadEnded() {
  if (!endedLoaded) {
    endedLoaded = AsyncStorage.getItem(ENDED_KEY)
      .then((raw) => {
        if (!raw) return;
        const now = Date.now();
        const stored = JSON.parse(raw) as Record<string, number>;
        for (const [id, at] of Object.entries(stored)) {
          if (now - at < ENDED_TTL_MS && !ended.has(id)) ended.set(id, at);
        }
      })
      .catch(() => {});
  }
  return endedLoaded;
}

function saveEnded() {
  const now = Date.now();
  const out: Record<string, number> = {};
  for (const [id, at] of ended) if (now - at < ENDED_TTL_MS) out[id] = at;
  AsyncStorage.setItem(ENDED_KEY, JSON.stringify(out)).catch(() => {});
}

/** The call is over for this device: never ring or route to it again. */
export function markCallEnded(callId: string | undefined | null, reason: string) {
  if (!callId) return;
  if (!ended.has(callId)) callLog('ended', { callId, reason });
  ended.set(callId, Date.now());
  saveEnded();
  clearPendingFor(callId);
  EventEmitter.emit('call_ended', callId);
}

export async function isCallEnded(callId: string | undefined | null): Promise<boolean> {
  if (!callId) return true;
  await loadEnded();
  return ended.has(callId);
}

export function isCallEndedSync(callId: string | undefined | null) {
  return !callId || ended.has(callId);
}

/** Is this ring still inside the ring window? Rings without a time count as fresh. */
export function isRingFresh(at: number | string | undefined | null, now = Date.now()) {
  const t = typeof at === 'string' ? Number(at) : at;
  if (!t || !Number.isFinite(t)) return true;
  return now - t < RING_WINDOW_MS;
}

/** Can this call still ring here? Not ended and inside the ring window. */
export async function canRing(call: Pick<IncomingCall, 'callId' | 'at'>) {
  if (await isCallEnded(call.callId)) return false;
  return isRingFresh(call.at);
}

/** Reads a push / notification payload into an IncomingCall. */
export function callFromData(data: Record<string, unknown> | undefined | null): IncomingCall | null {
  if (!data) return null;
  const callId = typeof data.callId === 'string' ? data.callId : null;
  const chatId = typeof data.chatId === 'string' ? data.chatId : null;
  if (!callId || !chatId) return null;
  const intent = data.intent;
  // Device-clock times only: a phone with a wrong clock must still ring, so a
  // server timestamp is never compared with Date.now().
  const at = Number(data.receivedAt ?? data.at);
  return {
    callId,
    chatId,
    kind: intent === 'video-call' || data.kind === 'video' ? 'video' : 'voice',
    caller: typeof data.caller === 'string' ? data.caller : undefined,
    at: Number.isFinite(at) && at > 0 ? at : undefined,
  };
}

// ── Screen registry ────────────────────────────────────────────────────────
// The call screen registers its call, so an Answer tap on the notification
// joins the open screen instead of stacking a second one (two Daily call
// objects can't coexist).

let activeScreenCallId: string | null = null;

export function setActiveCallScreen(callId: string | null) {
  activeScreenCallId = callId;
}

export function getActiveCallScreen() {
  return activeScreenCallId;
}

// ── Routing requests ───────────────────────────────────────────────────────

let pending: (CallRoute & { requestedAt: number }) | null = null;
const handled = new Set<string>();

function clearPendingFor(callId: string) {
  if (pending?.callId === callId) {
    pending = null;
    AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
  }
}

/**
 * Ask the app to show a call: the ringing screen (answer=false) or straight
 * into the connected call (answer=true). Safe to call from any context: the
 * mounted app routes it at once, and a killed/background app picks it up on
 * launch. Repeats of the same request are ignored.
 */
export function requestCallRoute(route: CallRoute) {
  const key = `${route.answer ? 'answer' : 'open'}:${route.callId}`;
  if (handled.has(key)) return;
  // An answer supersedes an earlier "open" for the same call.
  if (pending && pending.callId === route.callId && pending.answer && !route.answer) return;
  callLog(route.answer ? 'route.answer' : 'route.open', { callId: route.callId, chatId: route.chatId });
  pending = { ...route, requestedAt: Date.now() };
  AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending)).catch(() => {});
  EventEmitter.emit('call_route');
}

/** The mounted app takes the parked request, if it is still worth acting on. */
export async function takeCallRoute(): Promise<CallRoute | null> {
  let next = pending;
  if (!next) {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      next = raw ? JSON.parse(raw) : null;
    } catch {
      next = null;
    }
  }
  pending = null;
  AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
  if (!next) return null;
  const key = `${next.answer ? 'answer' : 'open'}:${next.callId}`;
  if (handled.has(key)) return null;
  // Parked requests expire with the ring window; an answer gets a bit longer,
  // since a cold start can take a while.
  const maxAge = next.answer ? RING_WINDOW_MS + 30_000 : RING_WINDOW_MS;
  if (Date.now() - next.requestedAt > maxAge || (await isCallEnded(next.callId))) {
    callLog('route.dropped', { callId: next.callId, answer: next.answer });
    return null;
  }
  handled.add(key);
  return next;
}
