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
  // Read what's stored first. A freshly started app that ends a call before it
  // has loaded the stored set would otherwise overwrite it with just that one
  // call, and calls that ended earlier could ring again.
  loadEnded().then(() => {
    const now = Date.now();
    const out: Record<string, number> = {};
    for (const [id, at] of ended) if (now - at < ENDED_TTL_MS) out[id] = at;
    AsyncStorage.setItem(ENDED_KEY, JSON.stringify(out)).catch(() => {});
  });
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

// ── First ring ─────────────────────────────────────────────────────────────
// Android can hand the same ring push to the app again (it redelivers pushes
// to a process that was killed while handling them). The ring window is
// measured from the first time this device saw the call, so a replayed push
// can't ring again as if the call had just started.

const RINGS_KEY = 'kushi.call.rings';
const rings = new Map<string, number>();
let ringsLoaded: Promise<void> | null = null;

function loadRings() {
  if (!ringsLoaded) {
    ringsLoaded = AsyncStorage.getItem(RINGS_KEY)
      .then((raw) => {
        if (!raw) return;
        const now = Date.now();
        for (const [id, at] of Object.entries(JSON.parse(raw) as Record<string, number>)) {
          if (now - at < ENDED_TTL_MS && !rings.has(id)) rings.set(id, at);
        }
      })
      .catch(() => {});
  }
  return ringsLoaded;
}

/** When this device first received a ring for the call (now, if this is the first). */
export async function firstRingAt(callId: string, now = Date.now()): Promise<number> {
  await loadRings();
  const seen = rings.get(callId);
  if (seen) return seen;
  rings.set(callId, now);
  const out: Record<string, number> = {};
  for (const [id, at] of rings) if (now - at < ENDED_TTL_MS) out[id] = at;
  AsyncStorage.setItem(RINGS_KEY, JSON.stringify(out)).catch(() => {});
  return now;
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
// objects can't coexist). A screen that has been navigated to but hasn't
// mounted yet counts too, for a few seconds.

let activeScreenCallId: string | null = null;
let opening: { callId: string; at: number } | null = null;
const OPENING_MS = 5_000;

export function setActiveCallScreen(callId: string | null) {
  activeScreenCallId = callId;
  if (callId && opening?.callId === callId) opening = null;
}

export function getActiveCallScreen() {
  return activeScreenCallId;
}

/** The navigator is about to show this call's screen. */
export function markCallScreenOpening(callId: string) {
  opening = { callId, at: Date.now() };
}

/** Is this call's screen on screen, or on its way there? */
export function hasCallScreen(callId: string) {
  if (activeScreenCallId === callId) return true;
  return opening?.callId === callId && Date.now() - opening.at < OPENING_MS;
}

// The user asked to answer this call (notification, lock screen, CallKit). The
// call screen reads this when it mounts and when its call object is ready, so
// an Answer that lands while the screen is still opening is not lost.
const answerRequested = new Set<string>();

export function markAnswerRequested(callId: string) {
  answerRequested.add(callId);
}

export function wasAnswerRequested(callId: string | undefined | null) {
  return !!callId && answerRequested.has(callId);
}

// ── Lock-screen launch ─────────────────────────────────────────────────────
// Android started the app over the lock screen for a ringing call (the
// notification's full-screen launch). When that call's screen closes, the app
// steps aside so the phone is back on its lock screen (lib/hooks/use-lock-screen).

let lockScreenLaunch = false;

export function setLockScreenLaunch(value: boolean) {
  if (lockScreenLaunch === value) return;
  lockScreenLaunch = value;
  EventEmitter.emit('lock_screen_launch', value);
}

export function isLockScreenLaunch() {
  return lockScreenLaunch;
}

// ── Routing requests ───────────────────────────────────────────────────────

type Parked = CallRoute & { requestedAt: number };

let pending: Parked | null = null;
let pendingLoaded: Promise<void> | null = null;
const handled = new Set<string>();

const routeKey = (route: Pick<CallRoute, 'answer' | 'callId'>) => `${route.answer ? 'answer' : 'open'}:${route.callId}`;

/**
 * A request parked by an earlier run of the app (a notification tap handled in
 * the background, then the process died) is read from disk once. Everything
 * after that lives in memory, so taking a request never waits on storage while
 * a new one arrives. (It used to: a request made during that wait was wiped,
 * which is how an Answer tap could open the app with no call screen.)
 */
function loadPending() {
  if (!pendingLoaded) {
    pendingLoaded = AsyncStorage.getItem(PENDING_KEY)
      .then((raw) => {
        // A request made since launch is newer than anything stored.
        if (!raw || pending) return;
        const stored = JSON.parse(raw) as Parked;
        if (stored?.callId && stored?.chatId) pending = stored;
      })
      .catch(() => {});
  }
  return pendingLoaded;
}

function clearPendingFor(callId: string) {
  // An Answer stays parked even when the call ends first, so the app can say
  // "Call ended" instead of opening on a plain screen.
  if (pending?.callId === callId && !pending.answer) {
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
  if (handled.has(routeKey(route))) return;
  // An answer supersedes an earlier "open" for the same call.
  if (pending && pending.callId === route.callId && pending.answer && !route.answer) return;
  callLog(route.answer ? 'route.answer' : 'route.open', { callId: route.callId, chatId: route.chatId });
  pending = { ...route, requestedAt: Date.now() };
  AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending)).catch(() => {});
  EventEmitter.emit('call_route');
}

export type TakenRoute = {
  route: CallRoute;
  /**
   * `ok`: show it. `ended` / `expired`: the user tapped Answer but the call is
   * over (the caller hung up, or the ring ran out); tell them, don't leave them
   * on a plain screen. A stale "open" is dropped without a word.
   */
  status: 'ok' | 'ended' | 'expired';
};

/** The mounted app takes the parked request, if there is one. */
export async function takeCallRoute(): Promise<TakenRoute | null> {
  await Promise.all([loadPending(), loadEnded()]);
  // No awaits from here on: a request that arrives now is kept for the next take.
  const next = pending;
  if (!next) return null;
  pending = null;
  AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
  const key = routeKey(next);
  if (handled.has(key)) return null;
  handled.add(key);
  // Parked requests expire with the ring window; an answer gets a bit longer,
  // since a cold start can take a while.
  const maxAge = next.answer ? RING_WINDOW_MS + 30_000 : RING_WINDOW_MS;
  const status = ended.has(next.callId) ? 'ended' : Date.now() - next.requestedAt > maxAge ? 'expired' : 'ok';
  if (status !== 'ok') {
    callLog('route.dropped', { callId: next.callId, answer: next.answer, status });
    return next.answer ? { route: next, status } : null;
  }
  return { route: next, status };
}

/** Tests only: forget everything held in memory, as a fresh launch would. */
export function resetCallStateForTests() {
  ended.clear();
  endedLoaded = null;
  rings.clear();
  ringsLoaded = null;
  pending = null;
  pendingLoaded = null;
  handled.clear();
  answerRequested.clear();
  activeScreenCallId = null;
  opening = null;
  lockScreenLaunch = false;
}
