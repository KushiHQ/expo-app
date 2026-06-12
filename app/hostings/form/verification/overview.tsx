import Button from '@/components/atoms/a-button';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import RequestCard from '@/components/molecules/m-verification-request-card';
import TierLadder from '@/components/molecules/m-verification-tier-ladder';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useRouter } from '@/lib/hooks/use-router';
import {
  HostingVerificationRequestStatus,
  HostingVerificationTier,
  useHostingQuery,
  useHostingVerificationRequestsQuery,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import { hexToRgba } from '@/lib/utils/colors';
import { formatTierLabel, nextTier, TIER_TAGLINES } from '@/lib/utils/verification/tier';
import { ArrowRight, Award, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, View } from 'react-native';
import React from 'react';

export default function VerificationOverview() {
  const { id: hostingId } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const hostingIdStr = Array.isArray(hostingId) ? hostingId[0] : (hostingId ?? '');

  const [{ data, fetching, error }, refetchVerification] = useHostingVerificationRequestsQuery({
    variables: { hostingId: hostingIdStr },
  });
  const [{ data: hostingData, fetching: hostingFetching }, refetchHosting] = useHostingQuery({
    variables: { hostingId: hostingIdStr },
  });

  React.useEffect(() => {
    if (error) handleError(error);
  }, [error]);

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetching && !hostingFetching) setRefreshing(false);
  }, [fetching, hostingFetching]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetchVerification({ requestPolicy: 'network-only' });
    refetchHosting({ requestPolicy: 'network-only' });
  };

  const requests = data?.hostingVerificationRequests ?? [];
  const currentTier =
    hostingData?.hosting?.verification?.verificationTier ?? HostingVerificationTier.Unverified;
  const isTopTier = currentTier === HostingVerificationTier.KushiVetted;
  const next = nextTier(currentTier);

  const handleRequestAgain = (tier: HostingVerificationTier) => {
    router.push(`/hostings/form/verification/request?id=${hostingIdStr}&tier=${tier}`);
  };

  const hasInFlightRequest = requests.some(
    (r) =>
      r.status === HostingVerificationRequestStatus.Pending ||
      r.status === HostingVerificationRequestStatus.UnderReview,
  );

  return (
    <DetailsLayout
      title="Verification"
      backButton="translucent"
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View className="gap-6 pb-8">
        <CurrentTierHero
          currentTier={currentTier}
          isTopTier={isTopTier}
          nextTier={next}
          inFlight={hasInFlightRequest}
          onUpgrade={() => next && handleRequestAgain(next)}
        />

        {!isTopTier ? (
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: hexToRgba(colors.surface, 0.5),
              borderWidth: 1,
              borderColor: hexToRgba(colors.text, 0.06),
            }}
          >
            <View className="mb-3 flex-row items-center gap-2">
              <Award size={14} color={hexToRgba(colors.text, 0.6)} />
              <ThemedText
                style={{
                  fontSize: 11,
                  color: hexToRgba(colors.text, 0.6),
                  fontFamily: Fonts.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Tier progression
              </ThemedText>
            </View>
            <TierLadder currentTier={currentTier} isTopTier={isTopTier} />
          </View>
        ) : null}

        <View>
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.7),
              fontFamily: Fonts.bold,
              marginBottom: 10,
            }}
          >
            {requests.length > 0
              ? `History · ${requests.length} request${requests.length === 1 ? '' : 's'}`
              : 'History'}
          </ThemedText>

          {requests.length === 0 ? (
            <EmptyHistory />
          ) : (
            <View className="gap-3">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  id={request.id}
                  tier={request.tier}
                  status={request.status}
                  statusDetails={request.statusDetails}
                  documents={request.documents}
                  logs={request.logs}
                  createdAt={request.createdAt}
                  onRequestAgain={() => handleRequestAgain(request.tier)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </DetailsLayout>
  );
}

type HeroProps = {
  currentTier: HostingVerificationTier;
  isTopTier: boolean;
  nextTier: HostingVerificationTier | null;
  inFlight: boolean;
  onUpgrade: () => void;
};

const CurrentTierHero: React.FC<HeroProps> = ({
  currentTier,
  isTopTier,
  nextTier: next,
  inFlight,
  onUpgrade,
}) => {
  const colors = useThemeColors();

  if (isTopTier) {
    return (
      <View
        className="overflow-hidden rounded-3xl p-5"
        style={{
          backgroundColor: '#1E293B',
        }}
      >
        <View
          style={{
            position: 'absolute',
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: '#F59E0B',
            opacity: 0.18,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 20,
            bottom: -40,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#F59E0B',
            opacity: 0.1,
          }}
        />
        <View className="flex-row items-center gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Award size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba('#FFFFFF', 0.6),
                fontFamily: Fonts.semibold,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Top tier reached
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 20,
                color: '#FFFFFF',
                fontFamily: Fonts.bold,
                marginTop: 2,
              }}
            >
              {formatTierLabel(currentTier)}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          style={{
            fontSize: 13,
            color: hexToRgba('#FFFFFF', 0.75),
            marginTop: 12,
            lineHeight: 19,
          }}
        >
          Your hosting displays the Kushi Vetted badge. Guests see a fully-verified property and
          rank it higher in search.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      className="gap-3 rounded-3xl p-5"
      style={{
        backgroundColor: hexToRgba(colors.primary, 0.06),
        borderWidth: 1,
        borderColor: hexToRgba(colors.primary, 0.2),
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: hexToRgba(colors.primary, 0.15) }}
        >
          <ShieldCheck size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <ThemedText
            style={{
              fontSize: 11,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.semibold,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Current tier
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 20,
              color: colors.text,
              fontFamily: Fonts.bold,
              marginTop: 2,
            }}
          >
            {formatTierLabel(currentTier)}
          </ThemedText>
        </View>
      </View>
      <ThemedText
        style={{
          fontSize: 13,
          color: hexToRgba(colors.text, 0.7),
          lineHeight: 19,
        }}
      >
        {TIER_TAGLINES[currentTier]}
      </ThemedText>

      {next ? (
        <View
          className="mt-1 flex-row items-center justify-between gap-3 rounded-2xl p-3.5"
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.1),
            borderWidth: 1,
            borderColor: hexToRgba(colors.primary, 0.25),
          }}
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Sparkles size={16} color={colors['primary-content']} />
            </View>
            <View className="flex-1">
              <ThemedText
                style={{
                  fontSize: 10,
                  color: colors.primary,
                  fontFamily: Fonts.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Up next
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.text,
                  fontFamily: Fonts.bold,
                  marginTop: 1,
                }}
              >
                {formatTierLabel(next)}
              </ThemedText>
            </View>
          </View>
          <Button type="primary" onPress={onUpgrade} disabled={inFlight} className="flex-row gap-2">
            <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
              {inFlight ? 'In progress' : 'Upgrade'}
            </ThemedText>
            {!inFlight ? <ArrowRight size={14} color={colors['primary-content']} /> : null}
          </Button>
        </View>
      ) : null}
    </View>
  );
};

const EmptyHistory = () => {
  const colors = useThemeColors();
  return (
    <View
      className="items-center gap-3 rounded-2xl p-8"
      style={{
        backgroundColor: hexToRgba(colors.text, 0.03),
        borderWidth: 1,
        borderColor: hexToRgba(colors.text, 0.06),
        borderStyle: 'dashed',
      }}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
      >
        <ShieldCheck size={26} color={colors.primary} />
      </View>
      <ThemedText
        style={{
          fontSize: 15,
          color: colors.text,
          fontFamily: Fonts.bold,
          textAlign: 'center',
        }}
      >
        No verification requests yet
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 12,
          color: hexToRgba(colors.text, 0.6),
          textAlign: 'center',
          lineHeight: 18,
          maxWidth: 280,
        }}
      >
        When you submit your first request, you'll see it tracked here with status updates, admin
        feedback, and the documents you uploaded.
      </ThemedText>
    </View>
  );
};
