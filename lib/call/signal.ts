import { getAuthTokens } from '../utils/auth';
import { APP_VERSION_HEADERS } from '../k/app-version-store';
import { CallType } from '../services/graphql/generated';
import { callError, callLog } from './log';

const MUTATION = `mutation SendChatCallNotification($chatId: String!, $callType: CallType!, $callId: String!, $durationSeconds: Int, $callKind: String) {
  sendChatCallNotification(chatId: $chatId, callType: $callType, callId: $callId, durationSeconds: $durationSeconds, callKind: $callKind) { message }
}`;

/**
 * Sends a call signal (decline, cancel…) straight to the API with the stored
 * token. Works where there's no React tree or urql client: the Notifee
 * background handler, CallKit's decline button, a cold start. Retries once.
 */
export async function sendCallSignal(input: {
  chatId: string;
  callId: string;
  callType: CallType;
  callKind?: 'voice' | 'video';
  durationSeconds?: number;
}) {
  const url = process.env.EXPO_PUBLIC_GRAPHQL_URL;
  if (!url) return;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const tokens = await getAuthTokens();
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...APP_VERSION_HEADERS,
          ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
        },
        body: JSON.stringify({ query: MUTATION, variables: input }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && !body?.errors?.length) {
        callLog('signal.sent', { callId: input.callId, type: input.callType });
        return;
      }
      throw new Error(body?.errors?.[0]?.message ?? `HTTP ${res.status}`);
    } catch (e) {
      if (attempt === 1) callError('signal.failed', e, { callId: input.callId, type: input.callType });
      else await new Promise((r) => setTimeout(r, 1500));
    }
  }
}
