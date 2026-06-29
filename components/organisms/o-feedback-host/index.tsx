import React from 'react';
import FeedbackPromptModal from '@/components/molecules/m-feedback-prompt-modal';
import { canShowFeedback, useFeedbackStore } from '@/lib/stores/feedback';

/** Probability of asking for feedback in a given app session (when eligible). */
const RANDOM_CHANCE = 0.2;
/** Delay before showing, so the user lands in the app first. */
const SHOW_DELAY_MS = 5000;

/**
 * Mounted once in the signed-in tab layout. Occasionally (~20% per session) asks
 * for general app feedback, gated by the global 30-day cooldown in the feedback
 * store — so it never spams and never stacks on top of a booking-feedback prompt.
 */
export default function FeedbackHost() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // One roll per session: skip unless within the random chance AND the global
    // cooldown allows.
    if (!canShowFeedback()) return;
    if (Math.random() >= RANDOM_CHANCE) return;

    const timer = setTimeout(() => {
      // Re-check at fire time in case a booking prompt showed during the delay.
      if (!canShowFeedback()) return;
      setVisible(true);
      useFeedbackStore.getState().markPromptShown();
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <FeedbackPromptModal
      visible={visible}
      onDismiss={() => setVisible(false)}
      onSubmit={() => setVisible(false)}
    />
  );
}
