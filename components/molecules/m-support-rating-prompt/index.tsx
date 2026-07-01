import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import ThemedView from '@/components/atoms/a-themed-view';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';
import { useSubmitSupportRatingMutation } from '@/lib/services/graphql/generated';

interface SupportRatingPromptProps {
  chatId: string;
  onDismiss: () => void;
  onSubmit?: () => void;
}

const SupportRatingPrompt: React.FC<SupportRatingPromptProps> = ({
  chatId,
  onDismiss,
  onSubmit,
}) => {
  const colors = useThemeColors();
  const [, submitRating] = useSubmitSupportRatingMutation();
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const handleRate = async (rating: number) => {
    setSelectedRating(rating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await submitRating({
      input: {
        chatId,
        rating,
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
        <ThemedText style={{ fontSize: 32 }}>⭐</ThemedText>
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 16,
          }}
        >
          Thank you for rating!
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
          How was your support experience?
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 12,
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.regular,
          }}
        >
          Rate from 1 (poor) to 5 (excellent)
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <Pressable
            key={rating}
            onPress={() => handleRate(rating)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                selectedRating !== null && selectedRating >= rating
                  ? hexToRgba(colors.primary, 0.14)
                  : hexToRgba(colors.text, 0.05),
            }}
          >
            <ThemedText style={{ fontSize: 20 }}>
              {selectedRating !== null && selectedRating >= rating ? '⭐' : '☆'}
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

export default SupportRatingPrompt;
