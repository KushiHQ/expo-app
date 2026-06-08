import AnimatedStepper from '@/components/atoms/a-animated-stepper';
import Button from '@/components/atoms/a-button';
import FilePicker, { PickedFile } from '@/components/atoms/a-file-picker';
import ThemedText from '@/components/atoms/a-themed-text';
import TierPicker from '@/components/molecules/m-verification-tier-picker';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useToast } from '@/lib/hooks/use-toast';
import { generateRNFile, formMutation } from '@/lib/services/graphql/utils/fetch';
import {
  HostingVerificationTier,
  RequestHostingVerificationTierMutation,
  RequestHostingVerificationTierMutationVariables,
  useHostingVerificationTierQuery,
} from '@/lib/services/graphql/generated';
import { REQUEST_HOSTING_VERIFICATION_TIER } from '@/lib/services/graphql/requests/mutations/hostings';
import {
  formatTierLabel,
  parseDocumentRequirements,
  TIER_TAGLINES,
} from '@/lib/utils/verification/tier';
import { handleError } from '@/lib/utils/error';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from '@/lib/hooks/use-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, ArrowRight, Check, FileText, ShieldCheck, Sparkles } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

type Props = {
  hostingId: string;
  /** Optional tier pre-selected (e.g. when re-requesting after a Rejection). */
  initialTier?: HostingVerificationTier;
  /** Optional pre-fill for the docs already submitted (when re-requesting). */
  prefillDocumentNames?: string[];
  /** The hosting's current verified tier — used to disable tiers below it. */
  currentTier?: HostingVerificationTier;
  /** Title shown above the form (e.g. "Request Verification Upgrade"). */
  title?: string;
  /** Called after a successful submission. */
  onSubmitted?: () => void;
};

const RequestVerificationForm: React.FC<Props> = ({
  hostingId,
  initialTier,
  currentTier,
  title,
  onSubmitted,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<number>(initialTier ? 2 : 1);
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
    setSelectedTier(tier);
  };

  const handleContinueToDocs = () => {
    if (!selectedTier) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleBackToTier = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
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
          text1: 'Request submitted',
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
    <View className="gap-5">
      {title ? (
        <View className="gap-1">
          <ThemedText
            style={{
              fontSize: 22,
              fontFamily: Fonts.bold,
              color: colors.text,
              lineHeight: 28,
            }}
          >
            {title}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.65),
              lineHeight: 19,
            }}
          >
            {step === 1
              ? 'Pick the tier you want to be verified at. Higher tiers unlock a stronger badge on your listing.'
              : 'Upload the documents Kushi admins will review. Accepted: PDF or image.'}
          </ThemedText>
        </View>
      ) : null}

      <View className="items-center">
        <AnimatedStepper steps={2} currentStep={step} size={6} gap={6} />
      </View>

      {step === 1 ? (
        <View className="gap-4">
          <TierPicker
            selected={selectedTier}
            onSelect={handleSelectTier}
            currentTier={currentTier}
          />
          <View className="flex-row items-center gap-2 self-end pt-2">
            <Button
              type="primary"
              onPress={handleContinueToDocs}
              disabled={!selectedTier}
            >
              <ThemedText
                content="primary"
                style={{ fontFamily: Fonts.semibold }}
              >
                Continue
              </ThemedText>
              <ArrowRight size={16} color={colors['primary-content']} />
            </Button>
          </View>
        </View>
      ) : (
        <View className="gap-4">
          <Pressable
            onPress={handleBackToTier}
            className="flex-row items-center gap-2 self-start rounded-full px-2 py-1"
            style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
          >
            <ArrowLeft size={14} color={hexToRgba(colors.text, 0.7)} />
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.7),
                fontFamily: Fonts.medium,
              }}
            >
              {selectedTier ? formatTierLabel(selectedTier) : 'Change tier'}
            </ThemedText>
          </Pressable>

          {selectedTier ? (
            <View
              className="gap-1 rounded-2xl p-3.5"
              style={{
                backgroundColor: hexToRgba(colors.primary, 0.06),
                borderWidth: 1,
                borderColor: hexToRgba(colors.primary, 0.2),
              }}
            >
              <View className="flex-row items-center gap-2">
                <Sparkles size={14} color={colors.primary} />
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: colors.primary,
                    fontFamily: Fonts.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Targeting
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 15,
                  color: colors.text,
                  fontFamily: Fonts.bold,
                  marginTop: 2,
                }}
              >
                {formatTierLabel(selectedTier)}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  color: hexToRgba(colors.text, 0.65),
                  lineHeight: 17,
                  marginTop: 2,
                }}
              >
                {TIER_TAGLINES[selectedTier]}
              </ThemedText>
            </View>
          ) : null}

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <ThemedText
                style={{
                  fontSize: 11,
                  color: hexToRgba(colors.text, 0.6),
                  fontFamily: Fonts.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Documents
              </ThemedText>
              {requiredDocuments.length > 0 ? (
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: hexToRgba(colors.text, 0.5),
                    fontFamily: Fonts.medium,
                  }}
                >
                  {requiredDocuments.filter((d) => Boolean(picked[d])).length}/
                  {requiredDocuments.length} uploaded
                </ThemedText>
              ) : null}
            </View>

            {tierFetching ? (
              <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 13 }}>
                Loading requirements…
              </ThemedText>
            ) : requiredDocuments.length === 0 ? (
              <View
                className="flex-row items-center gap-2 rounded-xl p-3"
                style={{ backgroundColor: hexToRgba(colors.success, 0.08) }}
              >
                <Check size={14} color={colors.success} />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: colors.success,
                    fontFamily: Fonts.medium,
                  }}
                >
                  No documents required for this tier.
                </ThemedText>
              </View>
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

          <View
            className="flex-row items-center gap-2"
            style={{ marginTop: 4 }}
          >
            <View
              className="h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
            >
              <ShieldCheck size={16} color={colors.primary} />
            </View>
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba(colors.text, 0.6),
                flex: 1,
                lineHeight: 16,
              }}
            >
              Documents are stored encrypted and only visible to Kushi admins.
            </ThemedText>
          </View>

          <Button
            type="primary"
            loading={submitting}
            disabled={!allPicked || submitting}
            onPress={handleSubmit}
            className="mt-2"
          >
            <View className="flex-row items-center gap-2">
              <FileText size={16} color={colors['primary-content']} />
              <ThemedText
                content="primary"
                style={{ fontFamily: Fonts.semibold }}
              >
                {submitting
                  ? 'Submitting…'
                  : allPicked
                    ? 'Submit request'
                    : `Pick ${requiredDocuments.length} more document${
                        requiredDocuments.length === 1 ? '' : 's'
                      }`}
              </ThemedText>
            </View>
          </Button>
        </View>
      )}
    </View>
  );
};

export default RequestVerificationForm;
