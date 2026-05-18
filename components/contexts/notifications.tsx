import React from 'react';
import { CallType, useUpdatePushNotificationTokenMutation } from '@/lib/services/graphql/generated';
import { useUser } from '@/lib/hooks/user';
import {
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { handleIncomingCall, handleNotifeeEvent } from '@/lib/utils/call';
import { handleIncomingChatMessage } from '@/lib/utils/notifications';
import { useRouter } from 'expo-router';
import { CALL_TYPE_VALUE } from '@/lib/types/enums/hoting-chat';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import messaging from '@react-native-firebase/messaging';
import { EventEmitter } from '@/lib/utils/event-emitter';
import VoipPushNotification from 'react-native-voip-push-notification';

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

  const handledCallId = React.useRef<string | null>(null);
  // Tracks which chat the user is currently viewing (set by the chat screen)
  const currentChatId = React.useRef<string | null>(null);

  const setActiveChatId = React.useCallback((chatId: string | null) => {
    currentChatId.current = chatId;
  }, []);

  const routeToCall = React.useCallback(
    (data: any) => {
      if (!data?.chatId || !data?.intent || !data?.callId) return;

      const isVoice = data.intent === CALL_TYPE_VALUE[CallType.Voice];
      const isVideo = data.intent === CALL_TYPE_VALUE[CallType.Video];

      if (isVoice || isVideo) {
        router.push({
          pathname: isVoice ? '/chats/[id]/call/voice' : '/chats/[id]/call/video',
          params: {
            id: String(data.chatId),
            initiate: 'false',
            callId: String(data.callId),
          },
        });
      }
    },
    [router],
  );

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
              // Android uses FCM directly — clear any stale VoIP token
              updateToken({ input: { fcmToken, voipToken: null } });
            }
            // iOS token is sent once the VoIP token arrives via EventEmitter below
          }
        } else {
          setError(new Error('Permission denied'));
        }
      } catch (err) {
        console.error('Failed to setup messaging', err);
      }
    };

    setupMessaging();

    // iOS: receive VoIP push token from index.js and send to backend
    const handleVoipToken = (voipToken: string) => {
      if (user.user && Platform.OS === 'ios') {
        // Use ref so we always read the latest FCM token even if this
        // closure was created before setupMessaging() finished.
        updateToken({ input: { voipToken, fcmToken: tokenRef.current } });
      }
    };
    EventEmitter.on('voip_token', handleVoipToken);

    // Trigger PushKit to (re-)deliver the VoIP token now that the listener is
    // registered. Doing this here rather than only in index.js avoids a race
    // where PushKit fires before this effect has mounted its EventEmitter listener.
    if (Platform.OS === 'ios') {
      VoipPushNotification.registerVoipToken();
    }

    // iOS: user answered the call from the native CallKit UI
    const handleCallKeepAnswer = (callData: { callId: string; chatId: string; intent: string }) => {
      const isVideo = callData.intent === 'video-call';
      router.push({
        pathname: isVideo ? '/chats/[id]/call/video' : '/chats/[id]/call/voice',
        params: {
          id: callData.chatId,
          initiate: 'false',
          accept: 'true',
          callId: callData.callId,
        },
      });
    };

    // iOS: user declined the call from the native CallKit UI
    const handleCallKeepEnd = (callData: { callId: string; chatId: string; intent: string }) => {
      const isVideo = callData.intent === 'video-call';
      router.push({
        pathname: isVideo ? '/chats/[id]/call/video' : '/chats/[id]/call/voice',
        params: {
          id: callData.chatId,
          initiate: 'false',
          accept: 'false',
          callId: callData.callId,
        },
      });
    };

    EventEmitter.on('callkeep_answer', handleCallKeepAnswer);
    EventEmitter.on('callkeep_end', handleCallKeepEnd);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const notifications = await notifee.getDisplayedNotifications();

        const ringingNotification = notifications.find(
          (n) =>
            n.notification.data?.intent === CALL_TYPE_VALUE[CallType.Voice] ||
            n.notification.data?.intent === CALL_TYPE_VALUE[CallType.Video],
        );

        if (ringingNotification && ringingNotification.notification.data) {
          const data = ringingNotification.notification.data;

          if (handledCallId.current !== data.callId) {
            handledCallId.current = String(data.callId);
            routeToCall(data);
          }
        } else {
          handledCallId.current = null;
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    handleAppStateChange(AppState.currentState);

    // Handle Notifee notification from a cold start
    notifee.getInitialNotification().then(async (initialNotification) => {
      if (initialNotification) {
        const isAction = initialNotification.pressAction?.id !== 'default';

        await handleNotifeeEvent({
          type: isAction ? EventType.ACTION_PRESS : EventType.PRESS,
          detail: initialNotification,
        });
      }
    });

    // Handle tapping an FCM system-tray chat notification from a cold start
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.intent === 'notification' && remoteMessage.data?.id) {
          router.push(`/chats/${remoteMessage.data.id}` as any);
        }
      });

    // Handle tapping an FCM system-tray chat notification while app is backgrounded
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data?.intent === 'notification' && remoteMessage.data?.id) {
        router.push(`/chats/${remoteMessage.data.id}` as any);
      }
    });

    const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
      if (remoteMessage.data?.intent === 'cancel_call') {
        await handleIncomingCall(remoteMessage);
        return;
      }

      if (
        remoteMessage.data?.intent === CALL_TYPE_VALUE[CallType.Voice] ||
        remoteMessage.data?.intent === CALL_TYPE_VALUE[CallType.Video]
      ) {
        routeToCall(remoteMessage.data);
        return;
      }

      // Chat message: show a Notifee banner unless the user is already in this chat
      const chatId = remoteMessage.data?.id as string | undefined;
      const isViewingThisChat = chatId && currentChatId.current === chatId;

      if (isViewingThisChat) {
        // User is already looking at this chat — play in-chat ping only
        try {
          notificationPlayer.play();
        } catch (err) {
          console.log('Failed to play notification sound', err);
        }
      } else {
        // Show a visible Notifee banner
        try {
          await handleIncomingChatMessage(remoteMessage);
        } catch (err) {
          console.log('Failed to show chat notification banner', err);
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
      }
      await handleNotifeeEvent(event);
    });

    return () => {
      appStateSub.remove();
      unsubscribeForeground();
      unsubscribeNotifee();
      unsubscribeOpenedApp();
      EventEmitter.off('voip_token', handleVoipToken);
      EventEmitter.off('callkeep_answer', handleCallKeepAnswer);
      EventEmitter.off('callkeep_end', handleCallKeepEnd);
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
