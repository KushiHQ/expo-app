import React from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import DetailsLayout from '@/components/layouts/details';
import ThemedText from '@/components/atoms/a-themed-text';
import AButton from '@/components/atoms/a-button';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  useSubmitFeedbackMutation,
  FeedbackType,
} from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import * as Haptics from 'expo-haptics';

const FEEDBACK_CATEGORIES: { label: string; value: FeedbackType }[] = [
  { label: 'Bug Report', value: FeedbackType.BugReport },
  { label: 'Feature Request', value: FeedbackType.FeatureRequest },
  { label: 'General Feedback', value: FeedbackType.General },
  { label: 'Complaint', value: FeedbackType.Complaint },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [, submitFeedback] = useSubmitFeedbackMutation();

  const [selectedType, setSelectedType] = React.useState<FeedbackType>(FeedbackType.General);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [contactConsent, setContactConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError('Please enter your feedback');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmitting(true);
    setError('');

    const result = await submitFeedback({
      input: {
        feedbackType: selectedType,
        title: title.trim() || undefined,
        body: body.trim(),
        contactConsent,
      },
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message || 'Failed to submit feedback');
    } else {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (submitted) {
    return (
      <DetailsLayout title="Feedback">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
          <ThemedText style={{ fontSize: 48 }}>✅</ThemedText>
          <ThemedText
            style={{
              fontFamily: Fonts.semibold,
              fontSize: 20,
              textAlign: 'center',
            }}
          >
            Thank you!
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 14,
              color: hexToRgba(colors.text, 0.6),
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Your feedback has been submitted. We appreciate you helping us improve Kushi.
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: 24,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 14,
              backgroundColor: colors.primary,
            }}
          >
            <ThemedText
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 15,
                color: colors.background,
              }}
            >
              Go Back
            </ThemedText>
          </Pressable>
        </View>
      </DetailsLayout>
    );
  }

  return (
    <DetailsLayout title="Send Feedback" scrollable>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Selector */}
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          Category
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {FEEDBACK_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(cat.value);
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor:
                  selectedType === cat.value
                    ? colors.primary
                    : hexToRgba(colors.text, 0.15),
                backgroundColor:
                  selectedType === cat.value
                    ? hexToRgba(colors.primary, 0.1)
                    : 'transparent',
              }}
            >
              <ThemedText
                style={{
                  fontFamily:
                    selectedType === cat.value ? Fonts.semibold : Fonts.medium,
                  fontSize: 13,
                  color:
                    selectedType === cat.value
                      ? colors.primary
                      : hexToRgba(colors.text, 0.7),
                }}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Title */}
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          Title (optional)
        </ThemedText>
        <TextInput
          placeholder="Brief summary"
          placeholderTextColor={hexToRgba(colors.text, 0.3)}
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: colors['surface-01'],
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            fontFamily: Fonts.medium,
            color: colors.text,
            borderWidth: 1,
            borderColor: hexToRgba(colors.text, 0.08),
            marginBottom: 24,
          }}
        />

        {/* Body */}
        <ThemedText
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          Your Feedback
        </ThemedText>
        <TextInput
          placeholder="Tell us what's on your mind..."
          placeholderTextColor={hexToRgba(colors.text, 0.3)}
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            backgroundColor: colors['surface-01'],
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            fontFamily: Fonts.medium,
            color: colors.text,
            borderWidth: 1,
            borderColor: hexToRgba(colors.text, 0.08),
            minHeight: 140,
            marginBottom: 16,
          }}
        />

        {/* Contact Consent */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setContactConsent(!contactConsent);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: contactConsent
                ? colors.primary
                : hexToRgba(colors.text, 0.3),
              backgroundColor: contactConsent
                ? colors.primary
                : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {contactConsent && (
              <ThemedText style={{ fontSize: 12, color: colors.background, fontFamily: Fonts.semibold }}>
                ✓
              </ThemedText>
            )}
          </View>
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.medium,
              flex: 1,
            }}
          >
            It's okay to follow up with me about this feedback
          </ThemedText>
        </Pressable>

        {error ? (
          <ThemedText
            style={{
              fontSize: 13,
              color: '#ef4444',
              fontFamily: Fonts.medium,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </ThemedText>
        ) : null}

        <AButton
          title={submitting ? 'Submitting...' : 'Submit Feedback'}
          onPress={handleSubmit}
          disabled={submitting || !body.trim()}
          variant={submitting || !body.trim() ? 'outline' : 'solid'}
          type="primary"
        />
      </ScrollView>
    </DetailsLayout>
  );
}
