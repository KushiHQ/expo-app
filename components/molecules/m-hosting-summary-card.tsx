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
import { BookingQuery, HostingQuery } from '@/lib/services/graphql/generated';

type Props = {
  hosting: HostingQuery['hosting'] | BookingQuery['booking']['hosting'];
};

const HostingSummaryCard: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <>
      <View
        className="flex-row gap-4 rounded-2xl px-8 py-4"
        style={{
          backgroundColor: hexToRgba(colors.text, 0.05),
          boxShadow: SURFACE.shadow,
        }}
      >
        <View
          className="overflow-hidden rounded-2xl"
          style={{
            width: 110,
            height: 90,
          }}
        >
          <Image
            source={{
              uri: hosting.coverImage?.asset.publicUrl,
            }}
            style={{
              height: '100%',
              width: '100%',
              borderRadius: 12,
              maxWidth: 150,
            }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
        <View className="flex-1 justify-between">
          <ThemedText
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ fontSize: 18, fontFamily: Fonts.bold }}
          >
            {hosting.title}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.7) }}>
            {hosting.city}, {hosting.state}
          </ThemedText>
          <View className="flex-row items-center gap-1">
            <MynauiStarSolid color={colors.accent} size={16} />
            <ThemedText style={{ fontSize: 14 }}>{hosting.averageRating}</ThemedText>
            <ThemedText
              style={{
                fontSize: 14,
                fontFamily: Fonts.light,
                color: hexToRgba(colors.text, 0.7),
              }}
            >
              ({hosting.totalRatings ?? 0} Reviews)
            </ThemedText>
          </View>
        </View>
      </View>
    </>
  );
};

export default HostingSummaryCard;
