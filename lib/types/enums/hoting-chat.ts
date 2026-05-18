import { CallType } from '@/lib/services/graphql/generated';

export const CALL_TYPE_VALUE = {
  [CallType.Voice]: 'voice-call',
  [CallType.Video]: 'video-call',
} as const;
