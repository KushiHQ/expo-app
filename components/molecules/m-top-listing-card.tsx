import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import { joinLocation } from '@/lib/utils/locations';
import { MynauiStarSolid } from '../icons/i-star';
import { MapPin } from 'lucide-react-native';
import { HostAnalyticsQuery, HostingQuery } from '@/lib/services/graphql/generated';
import { formatPaymentInterval } from '@/lib/utils/hosting/interval';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting: HostAnalyticsQuery['hostAnalytics']['topListing'] | HostingQuery['hosting'];
  onPress?: () => void;
};

const TopListingCard: React.FC<Props> = ({ hosting, onPress }) => {
  const colors = useThemeColors();

  const intervalLabel = formatPaymentInterval(hosting?.paymentInterval) || null;

  return (
    <Pressable
      className="flex-row items-center gap-3.5 rounded-[20px] p-2.5"
      style={{
        backgroundColor: hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
      }}
      onPress={onPress}
    >
      <View className="h-[88px] w-[104px] overflow-hidden rounded-2xl">
        <Image
          source={{
            uri: hosting?.coverImage?.asset.publicUrl,
          }}
          style={{ height: '100%', width: '100%' }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
        />
      </View>
      <View className="flex-1 gap-1.5">
        <ThemedText
          style={{ fontSize: 15, fontFamily: Fonts.semibold }}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {hosting?.title}
        </ThemedText>
        <View className="flex-row items-center gap-1.5">
          <MapPin size={12} color={hexToRgba(colors.text, 0.45)} />
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            className="flex-1"
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.medium,
            }}
          >
            {joinLocation(hosting?.city, hosting?.state)}
          </ThemedText>
        </View>
        <View className="mt-0.5 flex-row items-center justify-between gap-2">
          <View>
            <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 15, color: colors.primary }}>
              ₦{Number(hosting?.price ?? '0').toLocaleString()}
            </ThemedText>
            {intervalLabel ? (
              <ThemedText
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 11,
                  color: hexToRgba(colors.text, 0.4),
                }}
              >
                {intervalLabel}
              </ThemedText>
            ) : null}
          </View>
          {hosting?.totalRatings ? (
            <View
              className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
              style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
            >
              <MynauiStarSolid color={colors.primary} size={12} />
              <ThemedText
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: 12,
                  color: colors.text,
                }}
              >
                {hosting?.averageRating?.toFixed(1)}
              </ThemedText>
              <ThemedText
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 11,
                  color: hexToRgba(colors.text, 0.45),
                }}
              >
                ({hosting?.totalRatings})
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default TopListingCard;
