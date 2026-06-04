import React from 'react';
import { View, Pressable, TextInput } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import ThemedView from '@/components/atoms/a-themed-view';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';
import { useSubmitFeedbackMutation, FeedbackType } from '@/lib/services/graphql/generated';

interface BookingFeedbackPromptProps {
  bookingId: string;
  onDismiss: () => void;
  onSubmit?: () => void;
}

const BookingFeedbackPrompt: React.FC<BookingFeedbackPromptProps> = ({
  bookingId,
  onDismiss,
  onSubmit,
}) => {
  const colors = useThemeColors();
  const [, submitFeedback] = useSubmitFeedbackMutation();
  const [rating, setRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleRate = async (score: number) => {
    setRating(score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await submitFeedback({
      input: {
        feedbackType: FeedbackType.General,
        title: `Booking: ${bookingId}`,
        rating: score,
        body: comment.trim() || `Post-booking rating: ${score}/5`,
        contactConsent: false,
      },
    });

    if (!result.error) {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        onSubmit?.();
      }, 1500);
    }
  };

  if (submitted) {
    return (
      <ThemedView
        style={{
          padding: 24,
          borderRadius: 20,
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ThemedText style={{ fontSize: 32 }}>🎉</ThemedText>
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 16,
          }}
        >
          Thanks for your feedback!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        padding: 20,
        borderRadius: 20,
        gap: 16,
      }}
    >
      <View>
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          How was your stay?
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 12,
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.regular,
          }}
        >
          Rate your experience from 1 (poor) to 5 (excellent)
        </ThemedText>
      </View>

      {/* Star Rating */}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((score) => (
          <Pressable
            key={score}
            onPress={() => handleRate(score)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                rating !== null && rating >= score ? colors.primary : hexToRgba(colors.text, 0.06),
              borderWidth: 1,
              borderColor:
                rating !== null && rating >= score ? colors.primary : hexToRgba(colors.text, 0.08),
            }}
          >
            <ThemedText style={{ fontSize: 20 }}>
              {rating !== null && rating >= score ? '⭐' : '☆'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onDismiss} style={{ alignItems: 'center', paddingTop: 4 }}>
        <ThemedText
          style={{
            fontSize: 13,
            color: hexToRgba(colors.text, 0.4),
            fontFamily: Fonts.medium,
          }}
        >
          Dismiss
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

export default BookingFeedbackPrompt;
