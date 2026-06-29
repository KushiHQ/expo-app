import React from 'react';
import { Modal, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import BookingFeedbackPrompt from './m-booking-feedback-prompt';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit?: () => void;
  bookingId?: string;
};

/**
 * Shared modal wrapper for the feedback prompt. Keyboard-aware so the input and
 * the Send/dismiss buttons stay visible above the keyboard on small screens,
 * and tapping the backdrop dismisses the keyboard + closes the prompt (so the
 * user is never trapped). The card itself absorbs taps so they don't close it.
 */
const FeedbackPromptModal: React.FC<Props> = ({ visible, onDismiss, onSubmit, bookingId }) => {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onDismiss();
          }}
          style={{
            flex: 1,
            backgroundColor: hexToRgba(colors.background, 0.8),
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {/* Absorbs taps so pressing the card doesn't bubble to the backdrop. */}
          <Pressable style={{ width: '100%', maxWidth: 400 }} onPress={() => {}}>
            <BookingFeedbackPrompt
              bookingId={bookingId}
              onDismiss={onDismiss}
              onSubmit={onSubmit}
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FeedbackPromptModal;
