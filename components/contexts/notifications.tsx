import React from 'react';
import { useUpdatePushNotificationTokenMutation } from '@/lib/services/graphql/generated';
import { useUser } from '@/lib/hooks/user';
import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
  activeCallNotifications,
  clearRinging,
  drainCallActions,
  handleIncomingCall,
  handleNotifeeEvent,
  isEndIntent,
  isRingIntent,
} from '@/lib/utils/call';
import {
  callFromData,
  canRing,
  firstRingAt,
  hasCallScreen,
  markAnswerRequested,
  markCallScreenOpening,
  requestCallRoute,
  setLockScreenLaunch,
  takeCallRoute,
} from '@/lib/call/state';
import { callLog } from '@/lib/call/log';
import { callEndedNotice } from '@/lib/call/notice';
import { useRootNavigationState } from 'expo-router';
import { handleIncomingAppUpdate, handleIncomingChatMessage } from '@/lib/utils/notifications';
import { isAppUpdateIntent, openAppStore } from '@/lib/utils/urls';
import { useRouter } from '@/lib/hooks/use-router';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { EventEmitter } from '@/lib/utils/event-emitter';
import VoipPushNotification from 'react-native-voip-push-notification';
import { useClient } from 'urql';
import { clearAppBadge, onBadgeSyncRequest, requestBadgeSync, syncAppBadge } from '@/lib/k/app-badge';

/**
 * Booking and application pushes carry { subject, id }. The old routes resolve
 * which side you're on (guest → your home, host → the application).
 * Verification pushes carry { intent: 'verification', hostingId }.
 */
function journeyRoute(data?: Record<string, unknown>): string | null {
  if (data?.intent === 'verification' && typeof data.hostingId === 'string' && data.hostingId) {
    return `/hostings/form/verification/overview?id=${data.hostingId}`;
  }
  const id = typeof data?.id === 'string' ? data.id : null;
  if (!id) return null;
  if (data?.subject === 'booking') return `/trips/booking/${id}`;
  if (data?.subject === 'booking_application') return `/users/booking-applications/${id}`;
  return null;
}

interface NotificationContextType {
  token: string | null;
  error: Error | null;
  /** Call from the chat screen to register/deregister itself as active */
  setActiveChatId: (chatId: string | null) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const tokenRef = React.useRef<string | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const { user } = useUser();
  const [, updateToken] = useUpdatePushNotificationTokenMutation();
  const router = useRouter();
  const notificationPlayer = useAudioPlayer(require('@/assets/audio/message-notification.mp3'));

  const pendingVoipTokenRef = React.useRef<string | null>(null);
  // Persists the VoIP token after it has been registered so onTokenRefresh can re-send both tokens together
  const savedVoipTokenRef = React.useRef<string | null>(null);
  // Tracks which chat the user is currently viewing (set by the chat screen)
  const currentChatId = React.useRef<string | null>(null);

  const setActiveChatId = React.useCallback((chatId: string | null) => {
    currentChatId.current = chatId;
  }, []);

  // App icon badge: the server's real unread count, re-read on sign-in, on
  // returning to the foreground and whenever something asks (a push landing,
  // a chat or notification read). Signed out → no badge.
  const client = useClient();
  React.useEffect(() => {
    if (!user.user?.id) {
      clearAppBadge().catch(() => {});
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      // Coalesce bursts (a chat read fires the mutation and a focus refetch).
      clearTimeout(timer);
      timer = setTimeout(() => {
        syncAppBadge(client).catch((err) => console.warn('Badge sync failed', err));
      }, 300);
    };
    sync();
    const offRequest = onBadgeSyncRequest(sync);
    const appStateSub = AppState.addEventListener('change', (st) => st === 'active' && sync());
    return () => {
      clearTimeout(timer);
      offRequest();
      appStateSub.remove();
    };
  }, [user.user?.id, client]);

  // ── Calls: one place turns "show this call" requests into navigation ──────
  // Requests come from pushes, notification taps (foreground, background,
  // cold start) and CallKit. They wait here until the navigator is mounted, so
  // a cold-start Answer is never lost, and an Answer for the call already on
  // screen joins it instead of stacking a second call screen.
  const navReady = !!useRootNavigationState()?.key;
  React.useEffect(() => {
    if (!navReady) return;
    let running = false;
    let again = false;
    const routeNext = async () => {
      const taken = await takeCallRoute();
      if (!taken) return;
      const { route, status } = taken;
      if (status !== 'ok') {
        // Answer was tapped, but the call is over: say so.
        callEndedNotice(route.caller);
        return;
      }
      if (route.answer) markAnswerRequested(route.callId);
      if (hasCallScreen(route.callId)) {
        // The screen is up (or opening): it joins; never a second screen.
        if (route.answer) EventEmitter.emit('call_answer', route.callId);
        return;
      }
      callLog('route.navigate', { callId: route.callId, answer: route.answer });
      markCallScreenOpening(route.callId);
      router.push({
        pathname: route.kind === 'video' ? '/chats/[id]/call/video' : '/chats/[id]/call/voice',
        params: {
          id: route.chatId,
          initiate: 'false',
          callId: route.callId,
          ...(route.answer ? { accept: 'true' } : {}),
          ...(route.at ? { at: String(route.at) } : {}),
        },
      });
    };
    // One request at a time; a request that arrives meanwhile is routed right
    // after. (It used to be skipped, and could then sit parked until the app
    // was next brought to the foreground.)
    const drain = async () => {
      if (running) {
        again = true;
        return;
      }
      running = true;
      try {
        do {
          again = false;
          await routeNext();
        } while (again);
      } catch (e) {
        console.warn('call route:', e);
      } finally {
        running = false;
      }
    };
    // Android: pick up what was tapped on the call notification (a cold start
    // from Answer carries it on the launch intent), then route it.
    const pull = () => {
      drainCallActions();
      drain();
    };
    pull();
    EventEmitter.on('call_route', drain);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && pull());
    return () => {
      EventEmitter.off('call_route', drain);
      sub.remove();
    };
  }, [navReady, router]);

  React.useEffect(() => {
    const messagingInstance = getMessaging();

    const setupMessaging = async () => {
      try {
        await notifee.requestPermission();
        const authStatus = await requestPermission(messagingInstance);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const fcmToken = await getToken(messagingInstance);
          setToken(fcmToken);
          tokenRef.current = fcmToken;

          if (fcmToken && user.user) {
            if (Platform.OS === 'android') {
              updateToken({ input: { fcmToken, voipToken: null } });
            } else {
              // iOS: always register the FCM token immediately so the backend can
              // send chat notifications even if the VoIP token hasn't arrived yet.
              // handleVoipToken will call updateToken again once PushKit delivers.
              updateToken({
                input: {
                  fcmToken,
                  voipToken: pendingVoipTokenRef.current ?? null,
                },
              });
              pendingVoipTokenRef.current = null;
            }
          }
        } else {
          setError(new Error('Permission denied'));
        }
      } catch (err) {
        console.error('Failed to setup messaging', err);
      }
    };

    setupMessaging();

    // Re-register whenever Firebase rotates the FCM token (reinstall, app update, token expiry).
    // Without this the server keeps a dead token and every notification fails with UNREGISTERED.
    const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, (newToken) => {
      setToken(newToken);
      tokenRef.current = newToken;
      if (user.user) {
        updateToken({
          input: {
            fcmToken: newToken,
            voipToken: Platform.OS === 'ios' ? savedVoipTokenRef.current : null,
          },
        });
      }
    });

    // iOS: receive VoIP push token from index.js and send to backend
    const handleVoipToken = (voipToken: string) => {
      savedVoipTokenRef.current = voipToken;
      if (Platform.OS === 'ios') {
        if (tokenRef.current) {
          // FCM token is already available — update backend with both tokens
          updateToken({ input: { voipToken, fcmToken: tokenRef.current } });
        } else {
          // FCM token not ready yet (setupMessaging still in flight) —
          // store VoIP token and let setupMessaging send both once it finishes
          pendingVoipTokenRef.current = voipToken;
        }
      }
    };
    EventEmitter.on('voip_token', handleVoipToken);

    // Trigger PushKit to (re-)deliver the VoIP token now that the listener is
    // registered. Doing this here rather than only in index.js avoids a race
    // where PushKit fires before this effect has mounted its EventEmitter listener.
    if (Platform.OS === 'ios') {
      VoipPushNotification.registerVoipToken();
    }

    // Android: coming back to the app while a call notification is up shows
    // the ringing screen, but only for a call that can still ring. A stale one
    // (missed, cancelled, declined, or left over from a killed app) is cleared.
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active' || Platform.OS !== 'android') return;
      // The native call notification, plus Notifee's for a build without it.
      const shown: Record<string, unknown>[] = activeCallNotifications();
      try {
        for (const n of await notifee.getDisplayedNotifications()) {
          if (n.notification.data) shown.push(n.notification.data);
        }
      } catch {}
      for (const data of shown) {
        if (!isRingIntent(data?.intent)) continue;
        const call = callFromData(data);
        if (!call) continue;
        if (await canRing(call)) {
          requestCallRoute({ ...call, answer: false });
        } else {
          callLog('ring.stale.cleared', { callId: call.callId });
          await clearRinging(call.chatId);
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    handleAppStateChange(AppState.currentState);

    // Handle Notifee notification from a cold start
    notifee.getInitialNotification().then(async (initialNotification) => {
      if (initialNotification) {
        const isAction = initialNotification.pressAction?.id !== 'default';
        if (initialNotification.pressAction?.id === 'full_screen') setLockScreenLaunch(true);

        await handleNotifeeEvent({
          type: isAction ? EventType.ACTION_PRESS : EventType.PRESS,
          detail: initialNotification,
        });
      }
    });

    // Handle tapping an FCM system-tray notification from a cold start
    getInitialNotification(messagingInstance).then((remoteMessage) => {
      if (remoteMessage?.data?.intent === 'notification' && remoteMessage.data?.id) {
        router.push(`/chats/${remoteMessage.data.id}` as any);
      } else if (isAppUpdateIntent(remoteMessage?.data?.intent as string)) {
        openAppStore();
      } else {
        const journey = journeyRoute(remoteMessage?.data);
        if (journey) router.push(journey as any);
      }
    });

    // Handle tapping an FCM system-tray notification while app is backgrounded
    const unsubscribeOpenedApp = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      if (remoteMessage?.data?.intent === 'notification' && remoteMessage.data?.id) {
        router.push(`/chats/${remoteMessage.data.id}` as any);
      } else if (isAppUpdateIntent(remoteMessage?.data?.intent as string)) {
        openAppStore();
      } else {
        const journey = journeyRoute(remoteMessage?.data);
        if (journey) router.push(journey as any);
      }
    });

    const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
      requestBadgeSync();
      // Caller cancelled or callee declined: clears the ring and closes the
      // call screen (handleIncomingCall emits call_cancelled).
      if (isEndIntent(remoteMessage.data?.intent)) {
        await handleIncomingCall(remoteMessage);
        return;
      }

      // Ringing while the app is open: straight to the ringing screen.
      if (isRingIntent(remoteMessage.data?.intent)) {
        const callId = remoteMessage.data?.callId;
        const receivedAt = typeof callId === 'string' ? await firstRingAt(callId) : Date.now();
        const call = callFromData({ ...remoteMessage.data, receivedAt });
        if (call && (await canRing(call))) {
          callLog('ring.foreground', { callId: call.callId });
          requestCallRoute({ ...call, answer: false });
        }
        return;
      }

      // App-update broadcast → show a banner with the "Update now" action.
      if (isAppUpdateIntent(remoteMessage.data?.intent as string)) {
        try {
          await handleIncomingAppUpdate(remoteMessage);
        } catch (err) {
          console.error('Failed to show app-update notification banner', err);
        }
        return;
      }

      // Only chat messages carry intent === 'notification'. Every other intent
      // (hosting saves, form updates, etc.) is intentionally ignored here — the
      // user is already looking at the app and sees toasts/UI feedback directly.
      if (remoteMessage.data?.intent !== 'notification') return;

      const chatId = remoteMessage.data?.id as string | undefined;
      const isViewingThisChat = chatId && currentChatId.current === chatId;

      if (isViewingThisChat) {
        // User is already looking at this chat — play in-chat ping only
        try {
          notificationPlayer.play();
        } catch (err) {
          console.error('Failed to play notification sound', err);
        }
      } else {
        // Show a visible Notifee banner for messages from other chats
        try {
          await handleIncomingChatMessage(remoteMessage);
        } catch (err) {
          console.error('Failed to show chat notification banner', err);
        }
      }
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(async (event) => {
      if (event.type === EventType.PRESS || event.type === EventType.ACTION_PRESS) {
        const data = event.detail.notification?.data as any;
        if (data?.intent === 'notification' && data?.chatId) {
          router.push(`/chats/${data.chatId}` as any);
          return;
        }
        if (isAppUpdateIntent(data?.intent)) {
          await openAppStore();
          return;
        }
      }
      await handleNotifeeEvent(event);
    });

    return () => {
      appStateSub.remove();
      unsubscribeForeground();
      unsubscribeNotifee();
      unsubscribeOpenedApp();
      unsubscribeTokenRefresh();
      EventEmitter.off('voip_token', handleVoipToken);
      if (Platform.OS === 'ios') {
        VoipPushNotification.removeEventListener('register');
      }
    };
  }, [user.user?.id]);

  return (
    <NotificationContext.Provider value={{ error, token, setActiveChatId }}>
      {children}
    </NotificationContext.Provider>
  );
};
