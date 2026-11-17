import { toast } from '../hooks/use-toast';
import { callLog } from './log';

/**
 * The user tapped Answer, but there is no call to put them in: the caller hung
 * up first, or the ring ran out. Say so, instead of opening the app on a plain
 * screen with the ringing stopped.
 */
export function callEndedNotice(caller?: string | null) {
  callLog('notice.ended', { caller: caller ?? undefined });
  toast.show({
    type: 'info',
    text1: 'Call ended',
    text2: caller ? `The call from ${caller} ended before it connected.` : 'The call ended before it connected.',
    duration: 6000,
  });
}

/** The call was answered but could not be connected. */
export function callFailedNotice() {
  callLog('notice.failed');
  toast.show({
    type: 'error',
    text1: 'Couldn’t connect the call',
    text2: 'Check your connection and try again.',
    duration: 6000,
  });
}
