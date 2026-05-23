import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  CallType,
  useHostingChatQuery,
  useSendChatCallNotificationMutation,
} from '../services/graphql/generated';
import { cast } from '../types/utils';
import { useCountUp } from './use-countup';
import { useAudioPlayer } from 'expo-audio';
import Daily, { DailyCall, DailyParticipant } from '@daily-co/react-native-daily-js';
import notifee from '@notifee/react-native';
import { stopRingtone } from '../utils/call';
import { BackHandler, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { useLockScreen } from './use-lock-screen';
import { EventEmitter } from '../utils/event-emitter';

const callerRingtone = require('@/assets/audio/caller-ringtone.mp3');
const receiverRingtone = require('@/assets/audio/ringtone.mp3');

export const useActiveCall = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isVideoCall = pathname.endsWith('video');
  const { id, initiate, accept, callId } = useLocalSearchParams();
  const { isLockScreenLaunch } = useLockScreen();

  const [call, setCall] = useState<DailyCall | null>(null);
  const [localParticipant, setLocalParticipant] = useState<DailyParticipant | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<DailyParticipant | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(isVideoCall);
  const [micEnabled, setMicEnabled] = useState(true);

  const [isRinging, setIsRinging] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(isVideoCall);
  const [, sendNotification] = useSendChatCallNotificationMutation();

  const hasLeftRef = useRef(false);
  const actionHandled = useRef(false);

  const [{ data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });

  useEffect(() => {
    const cleanupNotification = async () => {
      try {
        await stopRingtone();

        await notifee.stopForegroundService();
        if (id) {
          await notifee.cancelNotification(String(id));
        }
      } catch (error) {
        console.warn('Failed to cleanup background notification', error);
      }
    };

    if (initiate !== 'true') {
      cleanupNotification();
    }
  }, [id, initiate]);

  const { formatted: callDuration } = useCountUp(!isRinging);

  const player = useAudioPlayer(initiate === 'true' ? callerRingtone : receiverRingtone);

  const handleLeave = useCallback(async () => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;

    try {
      player.pause();
    } catch (e) {
      console.warn(e);
    }
    try {
      if (call) {
        await call.leave();
      }
    } catch (e) {
      console.warn('Error leaving call', e);
    }

    if (Platform.OS === 'ios' && callId) {
      try { RNCallKeep.endCall(String(callId)); } catch {}
    }

    if (isLockScreenLaunch) {
      BackHandler.exitApp();
    } else {
      try { router.back(); } catch (e) { console.warn('handleLeave navigate:', e); }
    }
  }, [call, callId, player, router, isLockScreenLaunch]);

  const handleJoin = useCallback(async () => {
    try {
      if (!call) return;

      const domain = process.env.EXPO_PUBLIC_DAILY_DOMAIN;
      if (!domain) {
        throw new Error('Missing EXPO_PUBLIC_DAILY_DOMAIN in .env');
      }
      if (!callId) {
        throw new Error('Missing callId in route parameters');
      }
      const roomUrl = `https://${domain}/${callId}`;

      await call.join({
        url: roomUrl,
        videoSource: isVideoCall,
        audioSource: true,
      });

      if (initiate !== 'true') {
        setIsRinging(false);
      }
    } catch (e) {
      console.error('Join failed', e);
    }
  }, [call, isVideoCall, initiate, callId]);

  useEffect(() => {
    let callObj: DailyCall | null = null;
    try {
      callObj = Daily.createCallObject();
    } catch (e) {
      console.warn('DailyCall create failed:', e);
      return;
    }
    setCall(callObj);
    return () => {
      callObj?.destroy().catch(console.warn);
    };
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (initiate === 'true' && isRinging) {
      timeoutId = setTimeout(() => {
        sendNotification({
          chatId: cast(id),
          callId: String(callId),
          callType: CallType.Cancel,
        }).catch((err) => console.error('Failed to send timeout cancel push', err));

        handleLeave();
      }, 45000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [initiate, isRinging, id, callId, sendNotification, handleLeave]);

  useEffect(() => {
    const startRinging = async () => {
      try {
        if (isRinging) {
          player.loop = true;
          player.seekTo(0);
          player.play();
        } else {
          player.pause();
        }
      } catch (err) {
        console.error('Error loading ringtone', err);
      }
    };
    startRinging();

    return () => {
      try {
        player.pause();
      } catch (e) {
        console.warn(e);
      }
    };
  }, [player, isRinging]);

  useEffect(() => {
    if (!call) return;

    const updateParticipants = () => {
      const p = call.participants();
      setLocalParticipant(p.local);

      const remoteIds = Object.keys(p).filter((pid) => pid !== 'local');
      if (remoteIds.length > 0) {
        setRemoteParticipant(p[remoteIds[0]]);
        if (isRinging) setIsRinging(false);
      } else {
        setRemoteParticipant(null);
      }
    };

    const handleLeft = () => {
      if (hasLeftRef.current) return;
      hasLeftRef.current = true;
      if (Platform.OS === 'ios') {
        try { RNCallKeep.endAllCalls(); } catch {}
      }
      try { router.back(); } catch (e) { console.warn('handleLeft navigate:', e); }
    };

    call.on('joined-meeting', updateParticipants);
    call.on('participant-joined', updateParticipants);
    call.on('participant-updated', updateParticipants);

    call.on('participant-left', handleLeft);
    call.on('left-meeting', handleLeft);
    call.on('error', handleLeft);

    return () => {
      call.off('joined-meeting', updateParticipants);
      call.off('participant-joined', updateParticipants);
      call.off('participant-updated', updateParticipants);
      call.off('participant-left', handleLeft);
      call.off('left-meeting', handleLeft);
      call.off('error', handleLeft);
    };
  }, [call, id, router, isRinging]);

  // Dismiss call screen when the caller cancels or the remote party declines
  useEffect(() => {
    const onCallCancelled = () => { handleLeave(); };
    EventEmitter.on('call_cancelled', onCallCancelled);
    return () => { EventEmitter.off('call_cancelled', onCallCancelled); };
  }, [handleLeave]);

  useEffect(() => {
    if (!call || actionHandled.current) return;

    const setupCall = async () => {
      try {
        if (initiate === 'true') {
          actionHandled.current = true;

          await sendNotification({
            chatId: cast(id),
            callId: String(callId),
            callType: isVideoCall ? CallType.Video : CallType.Voice,
          });

          await handleJoin();
        } else if (accept === 'true') {
          actionHandled.current = true;
          await handleJoin();
        } else if (accept === 'false') {
          actionHandled.current = true;
          // Notify the caller immediately so they don't wait for the 45s timeout
          await sendNotification({
            chatId: cast(id),
            callId: String(callId),
            callType: CallType.Decline,
          }).catch((err) => console.warn('Failed to send decline signal', err));
          await handleLeave();
        } else {
          if (isVideoCall) {
            await call.startCamera();
          }
        }
      } catch (error) {
        console.error('Failed to setup call:', error);
        handleLeave();
      }
    };

    setupCall();
  }, [call, initiate, accept, callId, handleJoin, id, handleLeave, isVideoCall, sendNotification]);

  const toggleCamera = useCallback(() => {
    if (!call) return;
    const newState = !cameraEnabled;
    call.setLocalVideo(newState);
    setCameraEnabled(newState);
  }, [call, cameraEnabled]);

  const toggleMic = useCallback(() => {
    if (!call) return;
    const newState = !micEnabled;
    call.setLocalAudio(newState);
    setMicEnabled(newState);
  }, [call, micEnabled]);

  const toggleFacingCamera = useCallback(async () => {
    if (!call) return;

    try {
      await call.cycleCamera();
    } catch (e) {
      console.error('Failed to flip camera:', e);
    }
  }, [call]);

  const toggleSpeakerOn = () => setIsSpeakerOn((c) => !c);

  return {
    call,
    callDuration,
    isCaller: initiate === 'true',
    recipient: chatData?.hostingChat.recipientUser,
    leaveCall: handleLeave,
    joinCall: handleJoin,
    isRinging,
    isSpeakerOn,
    toggleSpeakerOn,
    remoteParticipant,
    localParticipant,
    toggleFacingCamera,
    toggleCamera,
    cameraEnabled,
    micEnabled,
    toggleMic,
  };
};
