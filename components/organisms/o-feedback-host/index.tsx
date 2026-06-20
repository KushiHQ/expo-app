import React from 'react';
import { Modal, View } from 'react-native';
import BookingFeedbackPrompt from '@/components/molecules/m-booking-feedback-prompt';
import { canShowFeedback, useFeedbackStore } from '@/lib/stores/feedback';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

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
  const colors = useThemeColors();
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

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View
        style={{
          flex: 1,
          backgroundColor: hexToRgba(colors.background, 0.8),
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <BookingFeedbackPrompt
          onDismiss={() => setVisible(false)}
          onSubmit={() => setVisible(false)}
        />
      </View>
    </Modal>
  );
}
