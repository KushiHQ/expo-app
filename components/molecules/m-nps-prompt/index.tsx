import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '@/components/atoms/a-themed-text';
import ThemedView from '@/components/atoms/a-themed-view';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';
import { useSubmitNpsMutation } from '@/lib/services/graphql/generated';

interface NPSPromptProps {
  context: string;
  onDismiss: () => void;
  onSubmit?: () => void;
}

const NPSPrompt: React.FC<NPSPromptProps> = ({ context, onDismiss, onSubmit }) => {
  const colors = useThemeColors();
  const [, submitNPS] = useSubmitNpsMutation();
  const [selectedScore, setSelectedScore] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleScorePress = async (score: number) => {
    if (submitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedScore(score);
    setSubmitting(true);

    const result = await submitNPS({
      input: {
        score,
        context,
      },
    });

    setSubmitting(false);

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
          How likely are you to recommend Kushi?
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 12,
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.regular,
          }}
        >
          0 = Not likely · 10 = Extremely likely
        </ThemedText>
      </View>

      {/* Score buttons */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: 11 }, (_, i) => i).map((score) => (
          <Pressable
            key={score}
            onPress={() => handleScorePress(score)}
            disabled={submitting}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                selectedScore === score
                  ? hexToRgba(colors.primary, 0.14)
                  : hexToRgba(colors.text, 0.05),
            }}
          >
            <ThemedText
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 14,
                color: selectedScore === score ? colors.primary : colors.text,
              }}
            >
              {score}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Labels */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <ThemedText
          style={{
            fontSize: 10,
            color: hexToRgba(colors.text, 0.35),
            fontFamily: Fonts.medium,
          }}
        >
          Not likely
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 10,
            color: hexToRgba(colors.text, 0.35),
            fontFamily: Fonts.medium,
          }}
        >
          Extremely likely
        </ThemedText>
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

export default NPSPrompt;
