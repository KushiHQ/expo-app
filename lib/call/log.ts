import * as Sentry from '@sentry/react-native';

/**
 * Call lifecycle breadcrumbs. Every step of a call (push received, ring shown,
 * answer/decline tapped, joined, left, audio session) leaves a breadcrumb, so a
 * failed call's Sentry event reads like a timeline.
 */
export function callLog(step: string, data?: Record<string, unknown>) {
  try {
    Sentry.addBreadcrumb({ category: 'call', level: 'info', message: step, data });
  } catch {}
  console.info('[call]', step, data ? JSON.stringify(data) : '');
}

/**
 * How an iOS call reached the phone (VoIP push, FCM fallback, notification
 * tap), sent to Sentry as its own small event: breadcrumbs alone only show up
 * when something fails, and "the call never rang" fails silently.
 */
export function callDelivery(path: 'voip' | 'fcm-background' | 'fcm-foreground' | 'fcm-alert-tap', callId?: string) {
  try {
    Sentry.captureMessage(`call.delivery: ${path}`, {
      level: 'info',
      tags: { area: 'call', step: 'delivery', path },
      extra: { callId },
    });
  } catch {}
  console.info('[call]', 'delivery', path, callId ?? '');
}

/** A call step that went wrong: reported to Sentry with the call tags. */
export function callError(step: string, error: unknown, data?: Record<string, unknown>) {
  try {
    Sentry.addBreadcrumb({ category: 'call', level: 'error', message: step, data });
    Sentry.captureException(error instanceof Error ? error : new Error(`${step}: ${String(error)}`), {
      tags: { area: 'call', step },
      extra: data,
    });
  } catch {}
  console.warn('[call]', step, error);
}
