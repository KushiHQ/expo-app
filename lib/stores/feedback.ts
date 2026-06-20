import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Throttle window for ANY feedback prompt (booking or random in-app). We never
 * show a feedback prompt more than once within this window, across the whole
 * app — this is the anti-spam guarantee.
 */
export const FEEDBACK_COOLDOWN_DAYS = 30;

interface FeedbackStore {
  /** bookingId -> timestamp the prompt was shown for it (shown once, ever). */
  handledBookings: Record<string, number>;
  /** Timestamp the last feedback prompt of any kind was shown. */
  lastPromptAt: number;
  markBookingHandled: (bookingId: string) => void;
  markPromptShown: () => void;
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      handledBookings: {},
      lastPromptAt: 0,
      markBookingHandled: (bookingId) =>
        set((state) => ({
          handledBookings: { ...state.handledBookings, [bookingId]: Date.now() },
        })),
      markPromptShown: () => set({ lastPromptAt: Date.now() }),
    }),
    {
      name: 'feedback-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** True if enough time has passed since the last feedback prompt of any kind. */
export function canShowFeedback(cooldownDays: number = FEEDBACK_COOLDOWN_DAYS): boolean {
  return Date.now() - useFeedbackStore.getState().lastPromptAt > cooldownDays * DAY;
}
