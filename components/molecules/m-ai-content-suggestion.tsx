import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import Button from '../atoms/a-button';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { useAiHostingContentSuggestionQuery } from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';

type Props = {
  hostingId: string;
  onApply: (suggestion: { title: string; description: string }) => void;
};

/**
 * Inline prompt that offers an AI-generated title + description for the
 * hosting. The host can preview, then apply (the values fill the form inputs
 * and stay editable) or dismiss. Suggestions are never auto-applied.
 */
const AiContentSuggestion: React.FC<Props> = ({ hostingId, onApply }) => {
  const colors = useThemeColors();
  const [open, setOpen] = React.useState(false);

  const [{ data, fetching, error }, reexecute] = useAiHostingContentSuggestionQuery({
    variables: { hostingId },
    pause: true,
  });

  React.useEffect(() => {
    if (error) handleError(error);
  }, [error]);

  const suggestion = data?.aiHostingContentSuggestion;

  const request = () => {
    setOpen(true);
    reexecute({ requestPolicy: 'network-only' });
  };

  return (
    <View
      style={{
        gap: 12,
        borderRadius: 12,
        padding: 14,
        backgroundColor: hexToRgba(colors.primary, 0.06),
        borderWidth: 1,
        borderColor: hexToRgba(colors.primary, 0.16),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} color={colors.primary} />
        <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14 }}>
          AI writing assistant
        </ThemedText>
      </View>

      {!open && (
        <>
          <ThemedText
            style={{ fontSize: 13, lineHeight: 19, color: hexToRgba(colors.text, 0.6) }}
          >
            Let AI draft a title and description from your property details. You can edit anything
            before saving.
          </ThemedText>
          <Button
            type="primary"
            onPress={request}
            className="flex-row items-center justify-center gap-2 py-2.5"
            style={{ borderRadius: 10 }}
          >
            <Sparkles size={16} color={colors['primary-content']} />
            <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
              Suggest with AI
            </ThemedText>
          </Button>
        </>
      )}

      {open && fetching && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
          <ActivityIndicator color={colors.primary} />
          <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6) }}>
            Writing a suggestion…
          </ThemedText>
        </View>
      )}

      {open && !fetching && suggestion && (
        <View style={{ gap: 10 }}>
          <View style={{ gap: 4 }}>
            <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.4) }}>
              Suggested title
            </ThemedText>
            <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }}>
              {suggestion.title}
            </ThemedText>
          </View>
          <View style={{ gap: 4 }}>
            <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.4) }}>
              Suggested description
            </ThemedText>
            <ThemedText
              style={{ fontSize: 13, lineHeight: 20, color: hexToRgba(colors.text, 0.75) }}
            >
              {suggestion.description}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              type="shade"
              className="flex-1 py-2.5"
              style={{ borderRadius: 10 }}
              onPress={() => setOpen(false)}
            >
              <ThemedText content="shade">Dismiss</ThemedText>
            </Button>
            <Button
              type="primary"
              className="flex-1 py-2.5"
              style={{ borderRadius: 10 }}
              onPress={() => {
                onApply({ title: suggestion.title, description: suggestion.description });
                setOpen(false);
              }}
            >
              <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
                Use suggestion
              </ThemedText>
            </Button>
          </View>
        </View>
      )}

      {open && !fetching && !suggestion && (
        <Button
          type="shade"
          onPress={request}
          className="py-2.5"
          style={{ borderRadius: 10 }}
        >
          <ThemedText content="shade">Try again</ThemedText>
        </Button>
      )}
    </View>
  );
};

export default AiContentSuggestion;
