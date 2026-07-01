import React from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import ThemedView from '@/components/atoms/a-themed-view';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';
import { Star, Sparkles, BadgeCheck } from 'lucide-react-native';
import { useSubmitFeedbackMutation, FeedbackType } from '@/lib/services/graphql/generated';

interface BookingFeedbackPromptProps {
  /** Omitted for the generic (random) in-app feedback ask. */
  bookingId?: string;
  onDismiss: () => void;
  onSubmit?: () => void;
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Exceptional'];

const BookingFeedbackPrompt: React.FC<BookingFeedbackPromptProps> = ({
  bookingId,
  onDismiss,
  onSubmit,
}) => {
  const colors = useThemeColors();
  const [{ fetching: submitting }, submitFeedback] = useSubmitFeedbackMutation();
  const [rating, setRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleRate = (score: number) => {
    setRating(score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (rating === null || submitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await submitFeedback({
      input: {
        feedbackType: FeedbackType.General,
        title: bookingId ? `Booking: ${bookingId}` : 'App experience',
        rating,
        body: comment.trim() || `App rating: ${rating}/5`,
        contactConsent: false,
      },
    });

    if (!result.error) {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onSubmit?.(), 1600);
    }
  };

  // Refined dark card shared by both states.
  const cardStyle = {
    width: '100%' as const,
    maxWidth: 400,
    padding: 28,
    borderRadius: 26,
    backgroundColor: hexToRgba(colors.text, 0.05),
  };

  if (submitted) {
    return (
      <ThemedView style={[cardStyle, { alignItems: 'center', gap: 14 }]}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: hexToRgba(colors.primary, 0.14),
          }}
        >
          <BadgeCheck size={32} color={colors.primary} strokeWidth={2} />
        </View>
        <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 19 }}>With gratitude.</ThemedText>
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center',
            color: hexToRgba(colors.text, 0.55),
            fontFamily: Fonts.regular,
            maxWidth: 260,
          }}
        >
          Your feedback shapes the Kushi experience. Thank you for helping us raise the standard.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[cardStyle, { gap: 20 }]}>
      {/* Header */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Sparkles size={12} color={colors.primary} />
          <ThemedText
            style={{
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.primary,
              fontFamily: Fonts.medium,
            }}
          >
            Your Experience
          </ThemedText>
        </View>
        <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 21, lineHeight: 27 }}>
          How’s your Kushi experience?
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.regular,
          }}
        >
          Your honest feedback on the app helps us make Kushi better for everyone.
        </ThemedText>
      </View>

      {/* Star rating */}
      <View style={{ alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((score) => {
            const active = rating !== null && score <= rating;
            return (
              <Pressable
                key={score}
                onPress={() => handleRate(score)}
                hitSlop={6}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active
                    ? hexToRgba(colors.primary, 0.14)
                    : hexToRgba(colors.text, 0.05),
                }}
              >
                <Star
                  size={24}
                  color={active ? colors.primary : hexToRgba(colors.text, 0.3)}
                  fill={active ? colors.primary : 'transparent'}
                  strokeWidth={active ? 0 : 1.8}
                />
              </Pressable>
            );
          })}
        </View>
        <ThemedText
          style={{
            fontSize: 13,
            fontFamily: Fonts.semibold,
            color: rating !== null ? colors.primary : hexToRgba(colors.text, 0.35),
          }}
        >
          {rating !== null ? RATING_LABELS[rating - 1] : 'Tap to rate'}
        </ThemedText>
      </View>

      {/* Message */}
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Tell us more about your experience (optional)"
        placeholderTextColor={hexToRgba(colors.text, 0.35)}
        multiline
        textAlignVertical="top"
        style={{
          minHeight: 88,
          borderRadius: 16,
          backgroundColor: hexToRgba(colors.text, 0.05),
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 14,
          lineHeight: 20,
          fontFamily: Fonts.regular,
        }}
      />

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={rating === null || submitting}
        style={{
          height: 54,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: rating === null ? hexToRgba(colors.primary, 0.3) : colors.primary,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#0A0A0A" />
        ) : (
          <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15, color: '#0A0A0A' }}>
            Send Feedback
          </ThemedText>
        )}
      </Pressable>

      <Pressable onPress={onDismiss} style={{ alignItems: 'center' }} hitSlop={8}>
        <ThemedText
          style={{
            fontSize: 13,
            color: hexToRgba(colors.text, 0.4),
            fontFamily: Fonts.medium,
          }}
        >
          Maybe later
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

export default BookingFeedbackPrompt;
