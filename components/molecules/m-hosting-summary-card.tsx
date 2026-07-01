import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { MynauiStarSolid } from '../icons/i-star';
import { MapPin } from 'lucide-react-native';
import { BookingQuery, HostingQuery } from '@/lib/services/graphql/generated';

type Props = {
  hosting: HostingQuery['hosting'] | BookingQuery['booking']['hosting'];
};

const HostingSummaryCard: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View
      className="flex-row items-center gap-3.5 rounded-[22px] p-3"
      style={{
        backgroundColor: hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
      }}
    >
      <View className="h-[92px] w-[112px] overflow-hidden rounded-2xl">
        <Image
          source={{
            uri: hosting.coverImage?.asset.publicUrl,
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
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ fontSize: 16, fontFamily: Fonts.bold }}
        >
          {hosting.title}
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
            {hosting.city}, {hosting.state}
          </ThemedText>
        </View>
        <View
          className="mt-0.5 flex-row items-center gap-1 self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
        >
          <MynauiStarSolid color={colors.primary} size={12} />
          <ThemedText
            style={{ fontSize: 12, fontFamily: Fonts.semibold, color: colors.text }}
          >
            {Number(hosting.averageRating ?? '0').toFixed(1)}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 11,
              fontFamily: Fonts.regular,
              color: hexToRgba(colors.text, 0.45),
            }}
          >
            ({hosting.totalRatings ?? 0})
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default HostingSummaryCard;
