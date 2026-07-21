import Button from '@/components/atoms/a-button';
import Carousel from '@/components/atoms/a-carousel';
import { HostingDetailsSkeleton } from '@/components/molecules/m-hosting-card';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  HostingKind,
  ListingEventKind,
  ListingType,
  UnitStructure,
  useHostingQuery,
  useInitiateHostingChatMutation,
  useRecordListingEventMutation,
} from '@/lib/services/graphql/generated';
import HostingUnits from '@/components/organisms/o-hosting-units';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { slugify } from '@/lib/utils/text';
import { formatPaymentInterval } from '@/lib/utils/hosting/interval';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import {
  AlignLeft,
  Building2,
  MapPin,
  MessageSquare,
  Rocket,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { SURFACE } from '@/lib/constants/surface';
import SectionHeader from '@/components/atoms/a-section-header';
import React from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useUser } from '@/lib/hooks/user';
import Skeleton from '@/components/atoms/a-skeleton';
import DetailsLayout from '@/components/layouts/details';
import HostingLikeButton from '@/components/atoms/a-hosting-like-button';
import ThemedText from '@/components/atoms/a-themed-text';
import TruncatedText from '@/components/atoms/a-truncated-text';
import { MynauiStarSolid } from '@/components/icons/i-star';
import HostingHost from '@/components/molecules/m-hosting-host';
import HostingFacilities from '@/components/molecules/m-hosting-facilities';
import HostingGalleryComponent from '@/components/molecules/m-hosting-gallery';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import HostingReviews from '@/components/organisms/o-hosting-reviews';
import HostingLocation from '@/components/molecules/m-hosting-location';
import AVerificationTierBadge from '@/components/atoms/a-verification-tier-badge';
import ListingTypeBadge from '@/components/atoms/a-listing-type-badge';
import ManagementBadge from '@/components/atoms/a-management-badge';
import {
  electricityBillingLabel,
  isAgentManaged,
  showElectricityDebt,
} from '@/lib/constants/hosting/step-rules';

export default function HostingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [_, initiateChat] = useInitiateHostingChatMutation();
  const [, recordListingEvent] = useRecordListingEventMutation();
  const [{ data, error, fetching }] = useHostingQuery({
    variables: { hostingId: cast(id), childrenOnSale: true },
    requestPolicy: 'cache-and-network',
  });
  const colors = useThemeColors();
  const { isTablet } = useBreakpoint();

  const hosting = data?.hosting;
  const { user, setReturnUrl } = useUser();
  const isHost = !!hosting && hosting.host.user.id === user.user?.id;

  const handleShare = async () => {
    const slug = `${slugify(hosting?.title ?? '')}___${id}`;
    const base = process.env.EXPO_PUBLIC_SHARE_PROPERTY_URL || 'https://kushicorp.com/guest/<slug>';
    const url = base.replace('<slug>', slug);
    // Tag so the recipient's web page offers/attempts to open the Kushi app.
    const shareUrl = `${url}${url.includes('?') ? '&' : '?'}shared=true`;
    // iOS treats `message` and `url` as separate share items, so putting the
    // link in BOTH duplicates it. On iOS keep the URL only in `url` (nicer link
    // preview too); on Android `url` is ignored, so the link must live in the
    // message text.
    const caption = `Check out this property on Kushi: ${hosting?.title}`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { title: hosting?.title ?? undefined, message: caption, url: shareUrl }
          : { title: hosting?.title ?? undefined, message: `${caption}\n\n${shareUrl}` },
      );
      if (hosting?.id) {
        recordListingEvent({ hostingId: hosting.id, kind: ListingEventKind.Share });
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  React.useEffect(() => {
    if (error) handleError(error);
  }, [error]);

  // Count a view once per listing load — but not when the owner views their own.
  React.useEffect(() => {
    if (hosting?.id && !isHost) {
      recordListingEvent({ hostingId: hosting.id, kind: ListingEventKind.View });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosting?.id, isHost]);

  const handleInitiateChat = () => {
    if (!hosting) return;
    // A guest exploring without an account can reach this screen. Instead of
    // firing the mutation (which errors), send them to sign in and bring them
    // right back to this listing afterwards via the returnUrl flow.
    if (!user.user?.id) {
      setReturnUrl(`/hostings/${hosting.id}`);
      router.push('/auth/sign-in');
      return;
    }
    recordListingEvent({ hostingId: hosting.id, kind: ListingEventKind.Message });
    initiateChat({ hostingId: hosting?.id }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data) {
        router.push(`/chats/${res.data.initiateHostingChat.id}`);
      }
    });
  };

  return (
    <DetailsLayout
      title="Property Details"
      withShare
      withSupport
      onShare={handleShare}
      footer={
        fetching ? (
          <View
            className="flex-row items-center gap-4 p-6"
            style={{ backgroundColor: colors.background }}
          >
            <View className="flex-1 gap-1">
              <Skeleton style={{ height: 14, width: 80, borderRadius: 4 }} />
              <Skeleton style={{ height: 20, width: 120, borderRadius: 4 }} />
            </View>
            <Skeleton style={{ height: 50, width: 140, borderRadius: 12 }} />
          </View>
        ) : isHost ? (
          <View
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 12,
              gap: 10,
            }}
          >
            <Button
              type="primary"
              onPress={() => router.push(`/hostings/form/onboarding?id=${hosting?.id}`)}
            >
              <ThemedText content="primary">Edit Listing</ThemedText>
            </Button>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button type="tinted" onPress={() => router.push(`/hostings/${hosting?.id}/boost`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Rocket size={16} color={colors.primary} />
                    <ThemedText content="tinted">Boost</ThemedText>
                  </View>
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  type="tinted"
                  onPress={() => router.push(`/hostings/${hosting?.id}/insights`)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={16} color={colors.primary} />
                    <ThemedText content="tinted">Insights</ThemedText>
                  </View>
                </Button>
              </View>
            </View>
          </View>
        ) : hosting?.kind === HostingKind.Parent &&
          hosting?.unitStructure !== UnitStructure.Group ? (
          <View
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 12,
            }}
          >
            <ThemedText
              style={{
                fontSize: 13,
                color: hexToRgba(colors.text, 0.6),
                textAlign: 'center',
              }}
            >
              {hosting.childCount} {hosting.childCount === 1 ? 'unit' : 'units'} available — choose
              one above to apply.
            </ThemedText>
          </View>
        ) : hosting?.kind === HostingKind.Child &&
          hosting?.parent?.unitStructure === UnitStructure.Group ? (
          <View
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(colors.text, 0.05),
                borderRadius: 14,
                padding: 14,
                gap: 4,
              }}
            >
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 13 }}>
                Part of a property sold as a whole
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55) }}>
                This unit isn’t sold on its own. Everything is transacted on the full property
                listing.
              </ThemedText>
            </View>
            <Button
              type="primary"
              onPress={() => router.push(`/hostings/${hosting?.parentId}`)}
            >
              <ThemedText content="primary">View the full property</ThemedText>
            </Button>
          </View>
        ) : isAgentManaged(hosting?.managementType) ? (
          <View
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(colors.text, 0.05),
                borderRadius: 14,
                padding: 14,
                gap: 4,
              }}
            >
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 13 }}>
                Managed by the agent
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55) }}>
                Contact the agent directly to arrange a viewing and terms. Kushi doesn’t process this
                transaction.
              </ThemedText>
            </View>
            <View className="mt-2 flex-row items-center justify-between gap-8">
              <View className="flex-1 gap-1">
                <ThemedText style={{ fontSize: 15, color: hexToRgba(colors.text, 0.6) }}>
                  Price
                </ThemedText>
                <View className="flex-row items-center gap-2">
                  <ThemedText>₦{Number(hosting?.price).toLocaleString()}</ThemedText>
                  <ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
                    {formatPaymentInterval(hosting?.paymentInterval)}
                  </ThemedText>
                </View>
              </View>
              <Button className="flex-1" type="primary" onPress={handleInitiateChat}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} color={colors['primary-content']} />
                  <ThemedText content="primary">Message Agent</ThemedText>
                </View>
              </Button>
            </View>
          </View>
        ) : hosting?.listingType === ListingType.Sale ? (
          <View
            style={{
              backgroundColor: colors.background,
              paddingHorizontal: 16,
              paddingBottom: 32,
              paddingTop: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: hexToRgba(colors.primary, 0.1),
                borderRadius: 14,
                padding: 14,
                gap: 6,
              }}
            >
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 13 }}>
                Sale — Coming Soon
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55) }}>
                Online purchase processing for sale listings isn’t available yet. Contact the host
                directly to arrange the sale.
              </ThemedText>
            </View>
            <View className="mt-4 flex-row justify-between gap-8">
              <View className="flex-1 gap-1">
                <ThemedText style={{ fontSize: 15, color: hexToRgba(colors.text, 0.6) }}>
                  Total Payment
                </ThemedText>
                <View className="flex-row items-center gap-2">
                  <ThemedText>₦{Number(hosting?.price).toLocaleString()}</ThemedText>
                  <ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
                    {formatPaymentInterval(hosting?.paymentInterval)}
                  </ThemedText>
                </View>
              </View>
              <Button className="flex-1" type="primary" onPress={handleInitiateChat}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} color={colors['primary-content']} />
                  <ThemedText content="primary">Message Host</ThemedText>
                </View>
              </Button>
            </View>
          </View>
        ) : (
          <View
            className="flex-row items-center p-6"
            style={{ backgroundColor: colors.background }}
          >
            <View className="gap-1">
              <ThemedText style={{ fontSize: 15, color: hexToRgba(colors.text, 0.6) }}>
                Total Payment
              </ThemedText>
              <View className="flex-row items-center gap-2">
                <ThemedText>₦{Number(hosting?.price).toLocaleString()}</ThemedText>
                <ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
                  {formatPaymentInterval(hosting?.paymentInterval)}
                </ThemedText>
              </View>
            </View>
            <View className="flex-1 items-end">
              <Button
                onPress={() => {
                  router.push(`/hostings/${hosting?.id}/reservation/checkout-summary/`);
                }}
                type="primary"
              >
                <ThemedText content="primary">Reserve Now</ThemedText>
              </Button>
            </View>
          </View>
        )
      }
    >
      <View>
        {fetching ? (
          <HostingDetailsSkeleton />
        ) : (
          <>
            <View style={{ height: isTablet ? 420 : 300 }} className="relative">
              <View
                style={{ boxShadow: SURFACE.shadow }}
                className="h-full w-full overflow-hidden rounded-3xl"
              >
                <Carousel autoplay style={{ height: '100%', width: '100%' }}>
                  {(hosting?.rooms.map((r) => r.images).flat() ?? []).map((img, index) => (
                    <Image
                      source={{
                        uri: img.asset?.id
                          ? getAssetResizeUrl(img.asset.id, 1280, 960, 85, img.asset.lastUpdated)
                          : img.asset?.publicUrl,
                      }}
                      style={{ height: '100%', width: '100%' }}
                      contentFit="cover"
                      transition={300}
                      placeholder={{ blurhash: PROPERTY_BLURHASH }}
                      placeholderContentFit="cover"
                      cachePolicy="memory-disk"
                      priority="high"
                      recyclingKey={img.id}
                      key={index}
                    />
                  ))}
                </Carousel>
              </View>
              {/* Verification tier badge sits over the carousel (outside the
								clipped wrapper so its tooltip isn't cut off). */}
              {hosting?.verification?.verificationTier && (
                <View className="absolute left-4 top-4">
                  <AVerificationTierBadge
                    tier={hosting.verification.verificationTier}
                    tooltipDescription={hosting.verification.tierTooltip ?? undefined}
                  />
                </View>
              )}
            </View>
            <View className="mt-8">
              <View className="gap-1.5">
                <View className="flex-row items-center justify-between">
                  <ThemedText
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    className="max-w-[82%]"
                    style={{
                      fontSize: 22,
                      fontFamily: Fonts.bold,
                      lineHeight: 28,
                    }}
                  >
                    {hosting?.title}
                  </ThemedText>
                  {hosting && !isHost && (
                    <HostingLikeButton saved={hosting?.saved ?? false} id={hosting?.id ?? ''} />
                  )}
                </View>
                {isHost && hosting && !hosting.verification?.verificationTier && (
                  <Pressable
                    onPress={() =>
                      router.push(`/hostings/form/verification/overview?id=${hosting.id}`)
                    }
                    style={{
                      marginTop: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: hexToRgba(colors.primary, 0.08),
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 13,
                          fontFamily: Fonts.medium,
                          color: colors.primary,
                        }}
                      >
                        Get this property verified
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                        It’s already listed — verification adds a trust badge guests look for.
                      </ThemedText>
                    </View>
                    <ThemedText style={{ fontSize: 18, color: colors.primary }}>›</ThemedText>
                  </Pressable>
                )}
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={13} color={hexToRgba(colors.text, 0.45)} />
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontFamily: Fonts.medium,
                      color: hexToRgba(colors.text, 0.6),
                    }}
                  >
                    {[hosting?.city, hosting?.state].filter(Boolean).join(', ')}
                  </ThemedText>
                </View>
                <View className="mt-2 flex-row flex-wrap items-center justify-between gap-3">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <ListingTypeBadge listingType={hosting?.listingType} />
                    <ManagementBadge managementType={hosting?.managementType} />
                    {hosting?.kind === HostingKind.Parent &&
                    hosting?.unitStructure === UnitStructure.Group ? (
                      <View
                        className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                        style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
                      >
                        <Building2 size={12} color={colors.primary} />
                        <ThemedText
                          style={{
                            fontSize: 12,
                            fontFamily: Fonts.semibold,
                            color: colors.primary,
                          }}
                        >
                          Sold as a whole · {hosting.childCount}{' '}
                          {hosting.childCount === 1 ? 'unit' : 'units'}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
                  >
                    <MynauiStarSolid size={13} color={colors.primary} />
                    <ThemedText style={{ fontSize: 13, fontFamily: Fonts.semibold }}>
                      {Number(hosting?.averageRating ?? '0').toFixed(1)}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: hexToRgba(colors.text, 0.45),
                      }}
                    >
                      ({Number(hosting?.totalRatings ?? '0')} reviews)
                    </ThemedText>
                  </View>
                </View>
                {hosting?.parentId ? (
                  <Pressable
                    onPress={() => router.push(`/hostings/${hosting.parentId}`)}
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
                      borderRadius: 999,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: hexToRgba(colors.primary, 0.1),
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontFamily: Fonts.medium,
                        color: colors.primary,
                      }}
                    >
                      Part of {hosting.parent?.title ?? 'this property'} ›
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
              <View
                className="my-8 rounded-3xl p-5"
                style={{
                  backgroundColor: hexToRgba(colors.text, 0.05),
                  boxShadow: SURFACE.shadow,
                }}
              >
                <SectionHeader icon={AlignLeft} title="Description" />
                <TruncatedText
                  text={hosting?.description ?? ''}
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.light,
                    color: hexToRgba(colors.text, 0.7),
                  }}
                />
              </View>
            </View>
            <HostingHost hosting={hosting} isHost={isHost} />
            <HostingFacilities hosting={hosting} />
            {hosting?.electricityBilling && (
              <View
                className="mt-8 gap-2 rounded-3xl p-5"
                style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
              >
                <SectionHeader icon={Zap} title="Electricity" />
                <ThemedText style={{ color: hexToRgba(colors.text, 0.7), fontSize: 15 }}>
                  {electricityBillingLabel(hosting.electricityBilling)}
                </ThemedText>
                {showElectricityDebt(hosting.electricityBilling, hosting.paymentInterval) && (
                  <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.55) }}>
                    {hosting.electricityBalanceCleared
                      ? 'No outstanding bills — cleared before move-in (as declared by the host).'
                      : hosting.electricityOutstandingBalance
                        ? `Outstanding balance: ₦${Number(
                            hosting.electricityOutstandingBalance,
                          ).toLocaleString()} — as declared by the host.`
                        : 'Ask the host about any outstanding bills.'}
                  </ThemedText>
                )}
              </View>
            )}
            <HostingUnits hosting={hosting} isHost={isHost} />

            <HostingGalleryComponent hosting={hosting} />
            <HostingReviews hosting={hosting} />
            <HostingLocation hosting={hosting} />
          </>
        )}
      </View>
    </DetailsLayout>
  );
}
