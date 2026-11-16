import { useEffect, useState } from 'react';
import { getAuthTokens, saveAuthTokens } from '@/lib/utils/auth';
import { APP_VERSION_HEADERS } from '@/lib/k/app-version-store';

/**
 * Live-updates (WebSocket) connection health, shared by the GraphQL client and
 * the screens that show live data.
 *
 * Drops are normal on a phone (backgrounding, power saving, Wi-Fi ↔ mobile
 * data), so the client reconnects and resubscribes on its own, and screens
 * catch up on anything they missed when it comes back. Users only hear about
 * it when the connection has been down for a long while.
 */

/** Only mention a dropped connection after this long. */
export const LONG_OUTAGE_MS = 60_000;

let connected = false;
let downSince: number | null = null;
const statusListeners = new Set<() => void>();
const reconnectListeners = new Set<() => void>();

function notifyStatus() {
  statusListeners.forEach((l) => l());
}

export function markLiveConnected() {
  const wasDown = downSince !== null;
  connected = true;
  downSince = null;
  notifyStatus();
  if (wasDown) reconnectListeners.forEach((l) => l());
}

export function markLiveDown() {
  connected = false;
  if (downSince === null) downSince = Date.now();
  notifyStatus();
}

/** Signed out: no socket, nothing to report. */
export function resetLiveConnection() {
  connected = false;
  downSince = null;
  notifyStatus();
}

/** Called when live updates come back after a drop: refetch what may have been missed. */
export function onLiveReconnected(cb: () => void) {
  reconnectListeners.add(cb);
  return () => {
    reconnectListeners.delete(cb);
  };
}

/** Ask screens to catch up (e.g. the app came back to the foreground). */
export function requestLiveCatchUp() {
  reconnectListeners.forEach((l) => l());
}

/** True only when live updates have been down for longer than LONG_OUTAGE_MS. */
export function useLiveOutage() {
  const [long, setLong] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(timer);
      if (connected || downSince === null) {
        setLong(false);
        return;
      }
      const left = LONG_OUTAGE_MS - (Date.now() - downSince);
      if (left <= 0) setLong(true);
      else {
        setLong(false);
        timer = setTimeout(update, left + 50);
      }
    };
    update();
    statusListeners.add(update);
    return () => {
      clearTimeout(timer);
      statusListeners.delete(update);
    };
  }, []);
  return long;
}

// ── Token freshness for the socket ──────────────────────────────────────────
// The socket authenticates once, in connection_init. Reconnecting with an
// expired access token used to leave every subscription failing with an auth
// error (the "Live updates paused" banner), because only HTTP requests ever
// refreshed the token.

const REFRESH = `mutation RefreshToken($input: RefreshTokenInput!) { refreshToken(input: $input) { data { token refreshToken } } }`;

function jwtExpiry(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = JSON.parse(globalThis.atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

let refreshing: Promise<string | null> | null = null;

/**
 * Refresh the access token now. One refresh at a time for the whole app (HTTP
 * and the socket share it), so two refreshes never race with the same refresh
 * token. Resolves with the new access token, or null when the API rejects the
 * refresh token (the session is over). Throws on network errors, which must
 * never sign anyone out.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const tokens = await getAuthTokens();
    const url = process.env.EXPO_PUBLIC_GRAPHQL_URL;
    if (!tokens?.refresh || !url) return null;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...APP_VERSION_HEADERS },
      body: JSON.stringify({ query: REFRESH, variables: { input: { refreshToken: tokens.refresh } } }),
    });
    if (res.status >= 500) throw new Error(`Refresh failed: HTTP ${res.status}`);
    const body = await res.json().catch(() => null);
    if (!body) throw new Error('Refresh failed: no response body');
    const data = body?.data?.refreshToken?.data;
    if (!data?.token) return null;
    await saveAuthTokens({ access: data.token, refresh: data.refreshToken ?? tokens.refresh });
    return data.token as string;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** The access token for the socket, refreshed first if it is about to expire. */
export async function freshAccessToken(): Promise<string | null> {
  const tokens = await getAuthTokens();
  if (!tokens?.access) return null;
  const exp = jwtExpiry(tokens.access);
  if (exp !== null && exp - Date.now() < 60_000) {
    try {
      return (await refreshAccessToken()) ?? tokens.access;
    } catch {
      return tokens.access;
    }
  }
  return tokens.access;
}
