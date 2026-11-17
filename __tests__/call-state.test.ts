/**
 * Incoming-call routing (lib/call/state.ts): the parked "show this call"
 * request must survive every ordering of tap, storage read and app mount.
 */

// AsyncStorage with a controllable delay, so a request can be made while a
// read is still in flight (as happens on a cold start).
const mockStore = new Map<string, string>();
let mockReadDelay = 0;
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    // Like the real thing, a read returns what was stored when it was asked
    // for, even if it takes a while to come back.
    getItem: (key: string) => {
      const value = mockStore.has(key) ? mockStore.get(key) : null;
      return new Promise((resolve) => setTimeout(() => resolve(value), mockReadDelay));
    },
    setItem: async (key: string, value: string) => void mockStore.set(key, value),
    removeItem: async (key: string) => void mockStore.delete(key),
  },
}));
jest.mock('@sentry/react-native', () => ({ addBreadcrumb: jest.fn(), captureException: jest.fn() }));

import {
  RING_WINDOW_MS,
  canRing,
  isCallEnded,
  firstRingAt,
  hasCallScreen,
  markCallEnded,
  markCallScreenOpening,
  requestCallRoute,
  resetCallStateForTests,
  setActiveCallScreen,
  takeCallRoute,
} from '../lib/call/state';

const call = (callId: string) => ({ callId, chatId: `chat-${callId}`, kind: 'voice' as const, caller: 'Ada' });

beforeEach(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  mockStore.clear();
  mockReadDelay = 0;
  resetCallStateForTests();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('takeCallRoute', () => {
  it('returns a parked Answer', async () => {
    requestCallRoute({ ...call('a'), answer: true });
    const taken = await takeCallRoute();
    expect(taken).toMatchObject({ status: 'ok', route: { callId: 'a', answer: true } });
    expect(await takeCallRoute()).toBeNull();
  });

  it('keeps an Answer that arrives while the first take is still reading storage', async () => {
    // The bug behind "Answer opens the app but there is no call": the app
    // mounts and asks for a parked request; the Answer tap lands during that
    // (slow, cold-start) storage read and used to be wiped by it.
    mockReadDelay = 50;
    const first = takeCallRoute();
    requestCallRoute({ ...call('b'), answer: true });
    const firstResult = await first;
    const taken = firstResult ?? (await takeCallRoute());
    expect(taken).toMatchObject({ status: 'ok', route: { callId: 'b', answer: true } });
  });

  it('picks up a request parked by an earlier run of the app', async () => {
    requestCallRoute({ ...call('c'), answer: true });
    await Promise.resolve();
    // The process dies and the app starts again: memory is gone, disk is not.
    const onDisk = new Map(mockStore);
    resetCallStateForTests();
    onDisk.forEach((value, key) => mockStore.set(key, value));
    expect(await takeCallRoute()).toMatchObject({ status: 'ok', route: { callId: 'c', answer: true } });
  });

  it('prefers a request made since launch over a stored one', async () => {
    requestCallRoute({ ...call('old'), answer: false });
    const onDisk = new Map(mockStore);
    resetCallStateForTests();
    onDisk.forEach((value, key) => mockStore.set(key, value));
    requestCallRoute({ ...call('new'), answer: true });
    expect(await takeCallRoute()).toMatchObject({ route: { callId: 'new', answer: true } });
  });

  it('reports an Answer for a call that has ended, instead of dropping it', async () => {
    requestCallRoute({ ...call('d'), answer: true });
    markCallEnded('d', 'cancel_call'); // the caller hung up before the app mounted
    expect(await takeCallRoute()).toMatchObject({ status: 'ended', route: { callId: 'd', caller: 'Ada' } });
    // Said once, not on every later look.
    requestCallRoute({ ...call('d'), answer: true });
    expect(await takeCallRoute()).toBeNull();
  });

  it('reports an Answer that waited too long as expired', async () => {
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'nextTick', 'setImmediate'] });
    jest.setSystemTime(1_000_000);
    requestCallRoute({ ...call('e'), answer: true });
    jest.setSystemTime(1_000_000 + RING_WINDOW_MS + 31_000);
    expect(await takeCallRoute()).toMatchObject({ status: 'expired', route: { callId: 'e' } });
  });

  it('drops a stale ringing-screen request without a word', async () => {
    requestCallRoute({ ...call('f'), answer: false });
    markCallEnded('f', 'cancel_call');
    expect(await takeCallRoute()).toBeNull();
  });

  it('lets an Answer replace an earlier ringing-screen request, not the reverse', async () => {
    requestCallRoute({ ...call('g'), answer: false });
    requestCallRoute({ ...call('g'), answer: true });
    requestCallRoute({ ...call('g'), answer: false });
    expect(await takeCallRoute()).toMatchObject({ route: { callId: 'g', answer: true } });
  });

  it('ignores a repeat of a request it already handed out', async () => {
    requestCallRoute({ ...call('h'), answer: true });
    expect(await takeCallRoute()).not.toBeNull();
    requestCallRoute({ ...call('h'), answer: true });
    expect(await takeCallRoute()).toBeNull();
  });
});

describe('ended calls', () => {
  it('are still remembered after a fresh launch ends another call first', async () => {
    markCallEnded('one', 'hangup');
    await new Promise((resolve) => setTimeout(resolve, 5));
    // New process: before anything has been read back, a cancel push arrives.
    const onDisk = new Map(mockStore);
    resetCallStateForTests();
    onDisk.forEach((value, key) => mockStore.set(key, value));
    markCallEnded('two', 'cancel_call');
    await new Promise((resolve) => setTimeout(resolve, 5));
    // And another launch: both must still count as ended.
    const later = new Map(mockStore);
    resetCallStateForTests();
    later.forEach((value, key) => mockStore.set(key, value));
    expect(await isCallEnded('one')).toBe(true);
    expect(await isCallEnded('two')).toBe(true);
  });
});

describe('firstRingAt', () => {
  it('keeps the time of the first ring, so a replayed push is not a new call', async () => {
    const t0 = Date.now();
    const first = await firstRingAt('r', t0);
    // Android redelivers the same push a minute later, to a restarted app.
    await Promise.resolve();
    const onDisk = new Map(mockStore);
    resetCallStateForTests();
    onDisk.forEach((value, key) => mockStore.set(key, value));
    const replay = await firstRingAt('r', t0 + 60_000);
    expect(replay).toBe(first);
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'nextTick', 'setImmediate'] });
    jest.setSystemTime(t0 + 60_000);
    expect(await canRing({ callId: 'r', at: replay })).toBe(false);
  });

  it('lets a new call ring', async () => {
    jest.useFakeTimers({ doNotFake: ['setTimeout', 'nextTick', 'setImmediate'] });
    jest.setSystemTime(2_000_000);
    const at = await firstRingAt('s');
    expect(at).toBe(2_000_000);
    expect(await canRing({ callId: 's', at })).toBe(true);
  });
});

describe('call screen registry', () => {
  it('counts a screen that is still opening', () => {
    expect(hasCallScreen('x')).toBe(false);
    markCallScreenOpening('x');
    expect(hasCallScreen('x')).toBe(true);
    setActiveCallScreen('x');
    setActiveCallScreen(null);
    expect(hasCallScreen('x')).toBe(false);
  });

  it('stops waiting for a screen that never mounted', () => {
    jest.useFakeTimers();
    jest.setSystemTime(5_000_000);
    markCallScreenOpening('y');
    jest.setSystemTime(5_000_000 + 6_000);
    expect(hasCallScreen('y')).toBe(false);
  });
});
