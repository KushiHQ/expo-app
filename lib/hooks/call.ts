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
import { clearRinging, playRingtone, stopRingtone } from '../utils/call';
import { Alert, BackHandler, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { useLockScreen } from './use-lock-screen';
import { EventEmitter } from '../utils/event-emitter';
import {
  RING_WINDOW_MS,
  getActiveCallScreen,
  isCallEnded,
  isRingFresh,
  markCallEnded,
  setActiveCallScreen,
  setLockScreenLaunch,
  wasAnswerRequested,
} from '../call/state';
import { callEndedNotice, callFailedNotice } from '../call/notice';
import { sendCallSignal } from '../call/signal';
import { ensureMicForCall } from '../call/permissions';
import { callError, callLog } from '../call/log';
import { isCallKitAnswered } from '../call/ios';

const callerRingtone = require('@/assets/audio/caller-ringtone.mp3');

/** How long the caller rings before giving up. */
const CALLER_RING_MS = 45_000;
/** Callee joined but the caller never shows up (they hung up meanwhile). */
const EMPTY_ROOM_MS = 20_000;
/** Ways an answered call can end before it connects that the callee didn't choose. */
const ENDED_BEFORE_CONNECT = new Set(['already ended', 'remote ended', 'ended elsewhere', 'caller gone', 'remote left']);

type Phase = 'ringing' | 'connecting' | 'active';

/**
 * One call screen (voice or video), for both sides:
 * - caller (initiate=true): rings the other person, joins the Daily room and
 *   waits; gives up after 45 s.
 * - callee: rings, or with accept=true joins at once (Answer on the
 *   notification, the lock screen or CallKit). An Answer that arrives while
 *   this screen is open joins it (call_answer), never a second screen.
 *
 * Every way out (decline, hang up, the other side leaving, cancel/decline
 * pushes, CallKit end, errors, the ring timing out) goes through `leave`, which
 * marks the call ended, stops the ringtone, tells the other side once, and
 * closes the screen.
 */
export const useActiveCall = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isVideoCall = pathname.endsWith('video');
  const callKind: 'voice' | 'video' = isVideoCall ? 'video' : 'voice';
  const params = useLocalSearchParams<{ id: string; initiate?: string; accept?: string; callId: string; at?: string }>();
  const id = String(params.id);
  const callId = String(params.callId);
  const isCaller = params.initiate === 'true';
  // Answer was tapped before this screen opened: on the notification (the
  // route carries accept=true) or while the screen was on its way up.
  const accepted = params.accept === 'true' || wasAnswerRequested(callId);
  const { isLockScreenLaunch } = useLockScreen();

  const [call, setCall] = useState<DailyCall | null>(null);
  const [localParticipant, setLocalParticipant] = useState<DailyParticipant | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<DailyParticipant | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(isVideoCall);
  const [micEnabled, setMicEnabled] = useState(true);
  const [phase, setPhase] = useState<Phase>(accepted ? 'connecting' : 'ringing');
  const [reconnecting, setReconnecting] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(isVideoCall);
  const [, sendNotification] = useSendChatCallNotificationMutation();

  const isRinging = phase === 'ringing';
  const hasLeftRef = useRef(false);
  const joinStartedRef = useRef(false);
  /** The callee answered (any way); set even before the call object exists. */
  const answeredRef = useRef(accepted);
  const remoteJoinedAtRef = useRef<number | null>(null);
  const callRef = useRef<DailyCall | null>(null);
  callRef.current = call;

  const [{ data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });

  const { formatted: callDuration } = useCountUp(phase === 'active');

  // Caller hears ringback; the callee's ringtone is the shared one in utils/call.
  const ringback = useAudioPlayer(callerRingtone);

  // ── Leaving ────────────────────────────────────────────────────────────────
  const leave = useCallback(
    async (reason: string, opts: { signal?: CallType; navigate?: boolean } = {}) => {
      if (hasLeftRef.current) return;
      hasLeftRef.current = true;
      callLog('leave', { callId, reason, isCaller });
      markCallEnded(callId, reason);
      // Answered, but the call was gone before anyone connected (the caller
      // hung up meanwhile): say so rather than just closing the screen.
      if (!isCaller && answeredRef.current && remoteJoinedAtRef.current === null && ENDED_BEFORE_CONNECT.has(reason)) {
        callEndedNotice();
      } else if (reason === 'daily error' && remoteJoinedAtRef.current === null) {
        // The call service refused the call before anyone connected.
        callFailedNotice();
      }
      await clearRinging(id);
      try {
        ringback.pause();
      } catch {}

      // Tell the other side once: the caller stamps the duration of an answered
      // call; otherwise the explicit signal (cancel / decline), if any.
      if (isCaller && remoteJoinedAtRef.current !== null) {
        const durationSeconds = Math.max(0, Math.round((Date.now() - remoteJoinedAtRef.current) / 1000));
        sendCallSignal({ chatId: id, callId, callType: CallType.Ended, durationSeconds, callKind });
      } else if (opts.signal) {
        sendCallSignal({ chatId: id, callId, callType: opts.signal, callKind });
      }

      try {
        await callRef.current?.leave();
      } catch (e) {
        console.warn('Error leaving call', e);
      }

      if (Platform.OS === 'ios') {
        try {
          RNCallKeep.endCall(callId);
        } catch {}
      }

      if (opts.navigate === false) return;
      if (isLockScreenLaunch) {
        // Back to the lock screen; the next launch is an ordinary one.
        setLockScreenLaunch(false);
        BackHandler.exitApp();
        return;
      }
      try {
        if (router.canGoBack()) router.back();
        else router.replace(`/chats/${id}` as any);
      } catch (e) {
        console.warn('leave navigate:', e);
      }
    },
    [callId, id, isCaller, callKind, ringback, router, isLockScreenLaunch],
  );
  const leaveRef = useRef(leave);
  leaveRef.current = leave;

  // ── Joining ────────────────────────────────────────────────────────────────
  const join = useCallback(async () => {
    const co = callRef.current;
    if (!co || joinStartedRef.current || hasLeftRef.current) return;
    joinStartedRef.current = true;
    try {
      const domain = process.env.EXPO_PUBLIC_DAILY_DOMAIN;
      if (!domain) throw new Error('Missing EXPO_PUBLIC_DAILY_DOMAIN');
      await ensureMicForCall();
      callLog('join.start', { callId, isCaller });
      await co.join({
        url: `https://${domain}/${callId}`,
        videoSource: isVideoCall,
        audioSource: true,
      });
      if (hasLeftRef.current) return;
      // Never start muted: the mic is on whenever a call connects.
      co.setLocalAudio(true);
      setMicEnabled(true);
      const all = co.participants();
      callLog('join.ok', {
        callId,
        audio: all.local?.tracks?.audio?.state,
        remotes: Object.keys(all).length - 1,
      });

      if (!isCaller) {
        setPhase('active');
        sendCallSignal({ chatId: id, callId, callType: CallType.Answered, callKind });
      }
    } catch (e) {
      callError('join.failed', e, { callId, isCaller });
      if (!hasLeftRef.current) {
        Alert.alert('Couldn’t connect the call', 'Check your connection and try again.');
        leaveRef.current('join failed', { signal: isCaller ? CallType.Cancel : undefined });
      }
    }
  }, [callId, id, isCaller, isVideoCall, callKind]);

  /** Callee: answer (button on this screen, the notification, or CallKit). */
  const answer = useCallback(async () => {
    if (isCaller || hasLeftRef.current || joinStartedRef.current) return;
    callLog('answer', { callId, ready: !!callRef.current });
    answeredRef.current = true;
    setPhase('connecting');
    await clearRinging(id);
    // No call object yet (Answer landed while the screen was mounting): the
    // start effect joins as soon as there is one.
    if (!callRef.current) return;
    if (Platform.OS === 'ios' && !isCallKitAnswered(callId)) {
      // Keep CallKit in step when the in-app button answers a CallKit call.
      try {
        RNCallKeep.answerIncomingCall(callId);
      } catch {}
    }
    await join();
  }, [isCaller, callId, id, join]);
  const answerRef = useRef(answer);
  answerRef.current = answer;

  // ── Screen registration + stale-ring guard ────────────────────────────────
  useEffect(() => {
    setActiveCallScreen(callId);
    callLog('screen.open', { callId, isCaller, accept: accepted });
    let cancelled = false;
    if (!isCaller) {
      isCallEnded(callId).then((ended) => {
        if (cancelled) return;
        // A call that's already over (or a ring older than the ring window)
        // never shows a ringing screen, e.g. after relaunching a killed app.
        if (ended || (!answeredRef.current && !isRingFresh(params.at))) {
          leaveRef.current(ended ? 'already ended' : 'stale ring');
        }
      });
    }
    return () => {
      cancelled = true;
      if (getActiveCallScreen() === callId) setActiveCallScreen(null);
      // Closed without leaving (e.g. a back gesture): still end the call.
      if (!hasLeftRef.current) {
        leaveRef.current('screen closed', {
          signal: isCaller ? CallType.Cancel : CallType.Decline,
          navigate: false,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  // ── Daily call object ─────────────────────────────────────────────────────
  useEffect(() => {
    let co: DailyCall | null = null;
    try {
      co = Daily.createCallObject();
    } catch (e) {
      callError('daily.create', e, { callId });
      return;
    }
    setCall(co);
    return () => {
      co?.destroy().catch(console.warn);
    };
  }, [callId]);

  // ── Ringing: ringtone, timeouts ───────────────────────────────────────────
  useEffect(() => {
    if (!isRinging) {
      try {
        ringback.pause();
      } catch {}
      if (!isCaller) stopRingtone();
      return;
    }
    if (isCaller) {
      try {
        ringback.loop = true;
        ringback.seekTo(0);
        ringback.play();
      } catch (e) {
        console.warn('ringback', e);
      }
      const t = setTimeout(() => leaveRef.current('no answer', { signal: CallType.Cancel }), CALLER_RING_MS);
      return () => clearTimeout(t);
    }
    // Callee: keep ringing while the screen is up, then give up with the window.
    playRingtone();
    const at = Number(params.at) || Date.now();
    const remaining = Math.max(1_000, RING_WINDOW_MS - (Date.now() - at));
    const t = setTimeout(() => leaveRef.current('missed'), remaining);
    return () => clearTimeout(t);
  }, [isRinging, isCaller, ringback, params.at]);

  // ── Daily events ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!call) return;

    const updateParticipants = () => {
      const p = call.participants();
      setLocalParticipant(p.local);
      const remoteIds = Object.keys(p).filter((pid) => pid !== 'local');
      if (remoteIds.length > 0) {
        setRemoteParticipant(p[remoteIds[0]]);
        if (remoteJoinedAtRef.current === null) {
          remoteJoinedAtRef.current = Date.now();
          callLog('remote.joined', { callId });
        }
        setPhase('active');
      } else {
        setRemoteParticipant(null);
      }
    };
    const onParticipantLeft = () => leaveRef.current('remote left');
    const onLeftMeeting = () => leaveRef.current('left meeting');
    const onError = (e: any) => {
      callError('daily.error', new Error(e?.errorMsg ?? 'Daily error'), { callId, error: e?.error });
      leaveRef.current('daily error');
    };
    const onDeviceError = (e: any) => {
      // Mic blocked or busy: say so instead of failing silently.
      callError('daily.device', new Error(e?.errorMsg ?? 'Device error'), { callId, type: e?.error?.type });
      if (e?.error?.type === 'permissions' || e?.error?.blockedMedia?.includes?.('audio')) ensureMicForCall();
    };
    const onNetwork = (e: any) => {
      if (e?.event === 'interrupted') {
        callLog('network.interrupted', { callId });
        setReconnecting(true);
      } else if (e?.event === 'connected') {
        setReconnecting(false);
      }
    };

    call.on('joined-meeting', updateParticipants);
    call.on('participant-joined', updateParticipants);
    call.on('participant-updated', updateParticipants);
    call.on('participant-left', onParticipantLeft);
    call.on('left-meeting', onLeftMeeting);
    call.on('error', onError);
    call.on('camera-error', onDeviceError);
    call.on('network-connection', onNetwork);

    return () => {
      call.off('joined-meeting', updateParticipants);
      call.off('participant-joined', updateParticipants);
      call.off('participant-updated', updateParticipants);
      call.off('participant-left', onParticipantLeft);
      call.off('left-meeting', onLeftMeeting);
      call.off('error', onError);
      call.off('camera-error', onDeviceError);
      call.off('network-connection', onNetwork);
    };
  }, [call, callId]);

  // Callee in the room but the caller never arrives (they hung up meanwhile).
  useEffect(() => {
    if (isCaller || phase !== 'active' || remoteParticipant) return;
    const t = setTimeout(() => {
      if (!remoteJoinedAtRef.current) leaveRef.current('caller gone');
    }, EMPTY_ROOM_MS);
    return () => clearTimeout(t);
  }, [isCaller, phase, remoteParticipant]);

  // ── Signals from outside the screen ───────────────────────────────────────
  useEffect(() => {
    const mine = (cid?: string | null) => !cid || cid === callId;
    const onCancelled = (cid?: string | null) => mine(cid) && leaveRef.current('remote ended');
    const onEnded = (cid?: string | null) => cid === callId && leaveRef.current('ended elsewhere');
    const onHangup = (cid?: string | null) => mine(cid) && leaveRef.current('callkit hangup');
    const onAnswer = (cid?: string | null) => cid === callId && answerRef.current();
    EventEmitter.on('call_cancelled', onCancelled);
    EventEmitter.on('call_ended', onEnded);
    EventEmitter.on('call_hangup', onHangup);
    EventEmitter.on('call_answer', onAnswer);
    return () => {
      EventEmitter.off('call_cancelled', onCancelled);
      EventEmitter.off('call_ended', onEnded);
      EventEmitter.off('call_hangup', onHangup);
      EventEmitter.off('call_answer', onAnswer);
    };
  }, [callId]);

  // ── Start: caller rings out, an accepted call joins, video previews ───────
  const startedRef = useRef(false);
  useEffect(() => {
    if (!call || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        if (isCaller) {
          callLog('ring.out', { callId, kind: callKind });
          const res = await sendNotification({
            chatId: cast(id),
            callId,
            callType: isVideoCall ? CallType.Video : CallType.Voice,
          });
          if (res.error) {
            callError('ring.out.failed', res.error, { callId });
            Alert.alert(
              'Couldn’t start the call',
              res.error.graphQLErrors?.[0]?.message ?? 'Check your connection and try again.',
            );
            leaveRef.current('ring failed');
            return;
          }
          await join();
        } else if (answeredRef.current || wasAnswerRequested(callId)) {
          await answerRef.current();
        } else if (isVideoCall) {
          await call.startCamera();
        }
      } catch (error) {
        callError('setup', error, { callId });
        leaveRef.current('setup failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

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

  const ringingOut = isCaller && phase === 'ringing';

  return {
    call,
    callDuration,
    isCaller,
    recipient: chatData?.hostingChat.recipientUser,
    /** Hang up; while the caller is still ringing, this cancels the call. */
    leaveCall: () => leave(ringingOut ? 'cancelled' : 'hangup', ringingOut ? { signal: CallType.Cancel } : {}),
    /** Callee: decline the ringing call (the caller is told at once). */
    declineCall: () => leave('declined', { signal: CallType.Decline }),
    joinCall: answer,
    isRinging,
    connecting: phase === 'connecting',
    reconnecting,
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
