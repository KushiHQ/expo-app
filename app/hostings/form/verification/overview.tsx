import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import { FileText } from 'lucide-react-native';
import DetailsLayout from '@/components/layouts/details';
import { VERIFICATION_STATUS_CONFIG } from '@/lib/utils/verification/status';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useRouter } from '@/lib/hooks/use-router';
import {
  HostingVerificationRequestStatus,
  HostingVerificationTier,
  useHostingVerificationRequestsQuery,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import { hexToRgba } from '@/lib/utils/colors';
import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import React from 'react';

export default function VerificationOverview() {
  const { id: hostingId } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const hostingIdStr = Array.isArray(hostingId) ? hostingId[0] : (hostingId ?? '');

  const [{ data, fetching, error }, refetch] = useHostingVerificationRequestsQuery({
    variables: { hostingId: hostingIdStr },
  });

  React.useEffect(() => {
    if (error) handleError(error);
  }, [error]);

  const requests = data?.hostingVerificationRequests ?? [];
  const latestRequest = requests[0];

  const handleRequestAgain = (tier: HostingVerificationTier) => {
    router.push(`/hostings/form/verification/request?id=${hostingIdStr}&tier=${tier}`);
  };

  return (
    <DetailsLayout
      title="Verification"
      backButton="translucent"
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={fetching}
          onRefresh={() => refetch({ requestPolicy: 'network-only' })}
          tintColor={colors.primary}
        />
      }
    >
      <View className="gap-5 pb-8">
        <View
          className="gap-2 rounded-2xl p-4"
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.08),
            borderColor: hexToRgba(colors.primary, 0.3),
            borderWidth: 1,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              color: colors.text,
              fontFamily: Fonts.semibold,
            }}
          >
            Request a higher verification tier
          </ThemedText>
          <ThemedText
            style={{ fontSize: 12, color: hexToRgba(colors.text, 0.7) }}
          >
            Upload supporting documents and our team will review your submission. Verified listings rank higher in search results.
          </ThemedText>
          <View className="mt-2">
            <Button
              type="primary"
              onPress={() =>
                handleRequestAgain(latestRequest?.tier ?? HostingVerificationTier.IdentityVerified)
              }
            >
              {latestRequest ? 'Request again' : 'Request verification'}
            </Button>
          </View>
        </View>

        <View>
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.semibold,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            History
          </ThemedText>

          {requests.length === 0 ? (
            <ThemedText
              style={{
                textAlign: 'center',
                padding: 24,
                color: hexToRgba(colors.text, 0.6),
              }}
            >
              No verification requests yet. Tap "Request verification" to get started.
            </ThemedText>
          ) : (
            <View className="gap-3">
              {requests.map((request) => {
                const statusConfig = VERIFICATION_STATUS_CONFIG[request.status];
                const StatusIcon = statusConfig.Icon;
                const isRejected = request.status === HostingVerificationRequestStatus.Rejected;
                return (
                  <View
                    key={request.id}
                    className="rounded-2xl p-4"
                    style={{
                      borderWidth: 1,
                      borderColor: hexToRgba(colors.text, 0.08),
                      backgroundColor: hexToRgba(colors.text, 0.03),
                    }}
                  >
                    <View className="mb-3 flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <ThemedText
                          style={{
                            fontSize: 15,
                            color: colors.text,
                            fontFamily: Fonts.semibold,
                          }}
                        >
                          {formatTierLabel(request.tier)}
                        </ThemedText>
                        <ThemedText
                          style={{
                            fontSize: 11,
                            color: hexToRgba(colors.text, 0.5),
                            marginTop: 2,
                          }}
                        >
                          {new Date(request.createdAt).toLocaleString()}
                        </ThemedText>
                      </View>
                      <View
                        className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${statusConfig.containerClass}`}
                      >
                        <StatusIcon size={12} className={statusConfig.accentClass} color={statusColor(statusConfig.accentClass)} />
                        <ThemedText
                          style={{
                            fontSize: 11,
                            fontFamily: Fonts.semibold,
                            color: statusColor(statusConfig.accentClass),
                          }}
                        >
                          {statusConfig.label}
                        </ThemedText>
                      </View>
                    </View>

                    {request.statusDetails ? (
                      <View
                        className="mt-2 rounded-xl p-3"
                        style={{ backgroundColor: hexToRgba(colors.text, 0.04) }}
                      >
                        <ThemedText
                          style={{ fontSize: 12, color: hexToRgba(colors.text, 0.75) }}
                        >
                          {request.statusDetails}
                        </ThemedText>
                      </View>
                    ) : null}

                    {request.documents.length > 0 ? (
                      <View className="mt-3">
                        <ThemedText
                          style={{
                            fontSize: 11,
                            color: hexToRgba(colors.text, 0.5),
                            fontFamily: Fonts.semibold,
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          Documents ({request.documents.length})
                        </ThemedText>
                        <View className="gap-1.5">
                          {request.documents.map((doc) => (
                            <View
                              key={doc.id}
                              className="flex-row items-center gap-2 rounded-lg p-2"
                              style={{ backgroundColor: hexToRgba(colors.text, 0.04) }}
                            >
                              <FileText size={14} color={colors.primary} />
                              <ThemedText
                                numberOfLines={1}
                                style={{ fontSize: 12, color: colors.text, flex: 1 }}
                              >
                                {doc.name}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {isRejected ? (
                      <View className="mt-3">
                        <Button
                          type="primary"
                          onPress={() => handleRequestAgain(request.tier)}
                        >
                          Request again
                        </Button>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </DetailsLayout>
  );
}

function formatTierLabel(tier: HostingVerificationTier): string {
  switch (tier) {
    case HostingVerificationTier.IdentityVerified:
      return 'Identity Verified';
    case HostingVerificationTier.AddressVerified:
      return 'Address Verified';
    case HostingVerificationTier.OwnerVerified:
      return 'Owner Verified';
    case HostingVerificationTier.KushiVetted:
      return 'Kushi Vetted';
    default:
      return 'Unverified';
  }
}

function statusColor(accentClass: string): string {
  // NativeWind text-color classes are already applied via `accentClass`;
  // this returns a hex fallback for the bare `color` prop on `LucideIcon` + `ThemedText`.
  if (accentClass.includes('yellow')) return '#EAB308';
  if (accentClass.includes('blue')) return '#3B82F6';
  if (accentClass.includes('green')) return '#22C55E';
  if (accentClass.includes('red')) return '#EF4444';
  return '#94A3B8';
}
