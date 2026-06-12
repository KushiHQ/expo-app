import Button from '@/components/atoms/a-button';
import FilePicker, { PickedFile } from '@/components/atoms/a-file-picker';
import ThemedText from '@/components/atoms/a-themed-text';
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
import { formatTierLabel, TIER_TAGLINES } from '@/lib/utils/verification/tier';
import { handleError } from '@/lib/utils/error';
import { hexToRgba } from '@/lib/utils/colors';
import { useRouter } from '@/lib/hooks/use-router';
import * as Haptics from 'expo-haptics';
import { Check, FileText, ShieldCheck, Sparkles } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { enumKeyByValue } from '@/lib/utils/enums';
import { cast } from '@/lib/types/utils';

type Props = {
  hostingId: string;
  /** The target tier for this request. */
  selectedTier?: HostingVerificationTier;
  /** Optional pre-fill for the docs already submitted (when re-requesting). */
  prefillDocumentNames?: string[];
  /** Title shown above the form (e.g. "Request Verification Upgrade"). */
  title?: string;
  /** Called after a successful submission. */
  onSubmitted?: () => void;
};

const RequestVerificationForm: React.FC<Props> = ({
  hostingId,
  selectedTier,
  title,
  onSubmitted,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const toast = useToast();

  const [picked, setPicked] = useState<Record<string, PickedFile | null>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPicked({});
  }, [selectedTier]);

  const [{ data: tierData, fetching: tierFetching, error: tierError }] =
    useHostingVerificationTierQuery({
      variables: {
        tier: cast(enumKeyByValue(HostingVerificationTier, cast(selectedTier))),
      },
      pause: !selectedTier,
    });

  useEffect(() => {
    if (tierError) handleError(tierError);
  }, [tierError]);

  const allPicked = useMemo(() => {
    if (tierData?.hostingVerificationTier?.documentRequirements.length === 0) return true;
    return tierData?.hostingVerificationTier?.documentRequirements.every((doc) =>
      Boolean(picked[doc.title]),
    );
  }, [picked]);

  const handleSubmit = async () => {
    if (!selectedTier || submitting) return;
    if (!allPicked) {
      toast.show({
        type: 'error',
        text2: `Please pick all ${tierData?.hostingVerificationTier?.documentRequirements.length} required document${
          tierData?.hostingVerificationTier?.documentRequirements.length === 1 ? '' : 's'
        }.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const names =
        tierData?.hostingVerificationTier?.documentRequirements.map((v) => v.title) ?? [];
      const files = (tierData?.hostingVerificationTier?.documentRequirements ?? []).map((doc) => {
        const f = picked[doc.title];
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
      const message = err instanceof Error ? err.message : 'Something went wrong while submitting.';
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
            Upload the documents Kushi admins will review. Accepted: PDF or image.
          </ThemedText>
        </View>
      ) : null}

      <View className="gap-4">
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
            {(tierData?.hostingVerificationTier?.documentRequirements ?? []).length > 0 ? (
              <ThemedText
                style={{
                  fontSize: 11,
                  color: hexToRgba(colors.text, 0.5),
                  fontFamily: Fonts.medium,
                }}
              >
                {
                  tierData?.hostingVerificationTier?.documentRequirements.filter((d) =>
                    Boolean(picked[d.title]),
                  ).length
                }
                /{tierData?.hostingVerificationTier?.documentRequirements.length} uploaded
              </ThemedText>
            ) : null}
          </View>

          {tierFetching ? (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 13 }}>
              Loading requirements…
            </ThemedText>
          ) : tierData?.hostingVerificationTier?.documentRequirements.length === 0 ? (
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
              {tierData?.hostingVerificationTier?.documentRequirements.map((doc) => (
                <FilePicker
                  key={doc.title}
                  label={doc.title}
                  description={doc.description}
                  hint="PDF or image"
                  disabled={submitting}
                  value={picked[doc.title] ?? null}
                  onChange={(file) => {
                    setPicked((prev) => ({ ...prev, [doc.title]: file }));
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-2" style={{ marginTop: 4 }}>
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
            <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
              {submitting
                ? 'Submitting…'
                : allPicked
                  ? 'Submit request'
                  : `Pick ${tierData?.hostingVerificationTier?.documentRequirements.length} more document${
                      tierData?.hostingVerificationTier?.documentRequirements.length === 1
                        ? ''
                        : 's'
                    }`}
            </ThemedText>
          </View>
        </Button>
      </View>
    </View>
  );
};

export default RequestVerificationForm;
