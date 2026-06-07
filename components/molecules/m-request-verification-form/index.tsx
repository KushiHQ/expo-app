import FilePicker, { PickedFile } from '@/components/atoms/a-file-picker';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useToast } from '@/lib/hooks/use-toast';
import { VERIFICATION_TIER_OPTIONS } from '@/lib/constants/hosting/verification';
import { Fonts } from '@/lib/constants/theme';
import { generateRNFile, formMutation } from '@/lib/services/graphql/utils/fetch';
import {
  HostingVerificationTier,
  RequestHostingVerificationTierMutation,
  RequestHostingVerificationTierMutationVariables,
  useHostingVerificationTierQuery,
} from '@/lib/services/graphql/generated';
import { REQUEST_HOSTING_VERIFICATION_TIER } from '@/lib/services/graphql/requests/mutations/hostings';
import { parseDocumentRequirements } from '@/lib/utils/verification/tier';
import { handleError } from '@/lib/utils/error';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from '@/lib/hooks/use-router';
import * as Haptics from 'expo-haptics';
import { Check, ShieldCheck } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  hostingId: string;
  /** Optional tier pre-selected (e.g. when re-requesting after a Rejection). */
  initialTier?: HostingVerificationTier;
  /** Title shown in the chrome (the `DetailsLayout` already provides a title — this is optional). */
  subtitle?: string;
  /** Called after a successful submission. */
  onSubmitted?: () => void;
};

const RequestVerificationForm: React.FC<Props> = ({ hostingId, initialTier, subtitle, onSubmitted }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const toast = useToast();

  const [selectedTier, setSelectedTier] = useState<HostingVerificationTier | undefined>(initialTier);
  const [picked, setPicked] = useState<Record<string, PickedFile | null>>({});
  const [submitting, setSubmitting] = useState(false);

  // Re-seed the picker map when the selected tier changes so previous picks
  // for a different tier don't leak through.
  useEffect(() => {
    setPicked({});
  }, [selectedTier]);

  const [{ data: tierData, fetching: tierFetching, error: tierError }] =
    useHostingVerificationTierQuery({
      variables: { tier: selectedTier as string },
      pause: !selectedTier,
    });

  const requiredDocuments = useMemo(() => {
    return parseDocumentRequirements(tierData?.hostingVerificationTier?.documentRequirements);
  }, [tierData]);

  useEffect(() => {
    if (tierError) handleError(tierError);
  }, [tierError]);

  const allPicked = useMemo(() => {
    if (requiredDocuments.length === 0) return true;
    return requiredDocuments.every((doc) => Boolean(picked[doc]));
  }, [picked, requiredDocuments]);

  const handleSelectTier = (tier: HostingVerificationTier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTier(tier);
  };

  const handleSubmit = async () => {
    if (!selectedTier || submitting) return;
    if (!allPicked) {
      toast.show({
        type: 'error',
        text2: `Please pick all ${requiredDocuments.length} required document${
          requiredDocuments.length === 1 ? '' : 's'
        }.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const names = requiredDocuments;
      const files = requiredDocuments.map((doc) => {
        const f = picked[doc];
        if (!f) {
          throw new Error(`Missing file for ${doc}`);
        }
        return generateRNFile(f.uri);
      });

      const res = await formMutation<
        RequestHostingVerificationTierMutation,
        RequestHostingVerificationTierMutationVariables
      >(REQUEST_HOSTING_VERIFICATION_TIER, {
        input: {
          hostingId,
          targetTier: selectedTier,
          documentNames: names,
          uploads: files,
        },
      });

      if (res.error) {
        handleError(res.error);
        return;
      }
      if (res.data?.requestHostingVerificationTier?.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.show({
          type: 'success',
          text1: 'Submitted',
          text2: res.data.requestHostingVerificationTier.message,
        });
        if (onSubmitted) {
          onSubmitted();
        } else {
          router.back();
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while submitting.';
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-6">
      {subtitle ? (
        <View>
          <ThemedText
            style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6) }}
          >
            {subtitle}
          </ThemedText>
        </View>
      ) : null}

      <View>
        <ThemedText
          style={{
            fontSize: 13,
            color: hexToRgba(colors.text, 0.6),
            fontFamily: Fonts.semibold,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          1. Choose a tier
        </ThemedText>
        <View className="gap-2">
          {VERIFICATION_TIER_OPTIONS.map((opt) => {
            const isSelected = selectedTier === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelectTier(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className="rounded-2xl p-4"
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : hexToRgba(colors.text, 0.1),
                  backgroundColor: isSelected
                    ? hexToRgba(colors.primary, 0.08)
                    : hexToRgba(colors.text, 0.03),
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
                  >
                    <ShieldCheck size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        fontFamily: Fonts.semibold,
                      }}
                    >
                      {opt.label}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: hexToRgba(colors.text, 0.65),
                        marginTop: 2,
                      }}
                    >
                      {opt.description}
                    </ThemedText>
                  </View>
                  {isSelected ? <Check size={18} color={colors.primary} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedTier ? (
        <View>
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.semibold,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            2. Upload documents
          </ThemedText>
          {tierFetching ? (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 13 }}>
              Loading requirements…
            </ThemedText>
          ) : requiredDocuments.length === 0 ? (
            <ThemedText
              style={{
                color: hexToRgba(colors.text, 0.6),
                fontSize: 13,
                fontStyle: 'italic',
              }}
            >
              No documents required for this tier.
            </ThemedText>
          ) : (
            <View className="gap-3">
              {requiredDocuments.map((doc) => (
                <FilePicker
                  key={doc}
                  label={doc}
                  hint="PDF or image"
                  disabled={submitting}
                  value={picked[doc] ?? null}
                  onChange={(file) => {
                    setPicked((prev) => ({ ...prev, [doc]: file }));
                  }}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={!selectedTier || !allPicked || submitting}
        className="items-center justify-center rounded-2xl py-4"
        style={{
          backgroundColor: colors.primary,
          opacity: !selectedTier || !allPicked || submitting ? 0.5 : 1,
        }}
      >
        <ThemedText
          style={{
            color: colors['primary-content'],
            fontFamily: Fonts.semibold,
            fontSize: 15,
          }}
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </ThemedText>
      </Pressable>
    </View>
  );
};

export default RequestVerificationForm;
