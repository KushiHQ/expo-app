import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { View, Platform } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import { MynauiStarSolid } from '../icons/i-star';
import { useFallbackImages } from '@/lib/hooks/images';
import { BookingQuery, HostingQuery } from '@/lib/services/graphql/generated';

type Props = {
  hosting: HostingQuery['hosting'] | BookingQuery['booking']['hosting'];
};

const HostingSummaryCard: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();
  const { failedImages, handleImageError } = useFallbackImages();

  return (
    <>
      <View
        className="flex-row gap-4 rounded-2xl border px-8 py-4"
        style={{
          backgroundColor: colors.background,
          borderColor: hexToRgba(colors.primary, 0.1),
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            },
            android: {
              elevation: 20,
              shadowColor: colors.primary,
            },
          }),
        }}
      >
        <View
          className="overflow-hidden rounded-2xl border"
          style={{
            width: 110,
            height: 90,
            borderColor: colors.text,
          }}
        >
          <Image
            source={{
              uri: failedImages.has(0) ? FALLBACK_IMAGE : hosting.coverImage?.asset.publicUrl,
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
            onError={() => handleImageError(0)}
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
