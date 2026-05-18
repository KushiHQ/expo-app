import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { formatDate } from '@/lib/utils/time';
import { MynauiStarSolid } from '../icons/i-star';
import Carousel from '../atoms/a-carousel';
import { Image } from 'expo-image';
import Skeleton from '../atoms/a-skeleton';
import { useRouter } from 'expo-router';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useFallbackImages } from '@/lib/hooks/images';
import { HostingQuery, HostingsQuery } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';
import HostingLikeButton from '../atoms/a-hosting-like-button';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
  hosting: HostingsQuery['hostings'][number] | HostingQuery['hosting'];
  disabled?: boolean;
  index?: number;
};

const HostingCard: React.FC<Props> = ({ hosting, disabled, index }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const { failedImages, handleImageError } = useFallbackImages();

  const scale = useSharedValue(1);
  const images = hosting.rooms.map((r) => r.images).flat();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10, stiffness: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/hostings/${hosting.id}`);
  };

  return (
    <Animated.View style={[animatedStyle, { gap: 12 }]}>
      <View
        style={{
          height: 290,
          backgroundColor: colors['surface-01'],
        }}
        className="relative overflow-hidden rounded-2xl"
      >
        <Carousel
          autoplay
          style={{ height: '100%', width: '100%' }}
          interval={3000 + 1000 * (index ?? 1)}
        >
          {images.map((img, index) => (
            <Image
              source={{
                uri: failedImages.has(index) ? FALLBACK_IMAGE : img.asset.publicUrl,
              }}
              style={{ height: '100%', width: '100%' }}
              contentFit="cover"
              transition={400}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
              onError={() => handleImageError(index)}
              key={img.id}
            />
          ))}
        </Carousel>
        <HostingLikeButton
          saved={hosting.saved}
          id={hosting.id}
          className="absolute right-4 top-4"
        />
      </View>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={{
            backgroundColor: hexToRgba(colors.text, 0.03),
          }}
          className="gap-1 rounded-2xl p-4"
        >
          <View className="flex-row items-start justify-between">
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
              className="max-w-[60%]"
            >
              {hosting.title}
            </ThemedText>
            <ThemedText
              style={{
                fontFamily: Fonts.bold,
                fontSize: 16,
                color: colors.primary,
              }}
            >
              ₦{Number(hosting.price)?.toLocaleString()}
            </ThemedText>
          </View>

          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.medium,
            }}
          >
            {hosting.state}, {hosting.country} • {capitalize(hosting.paymentInterval ?? '')}
          </ThemedText>

          <View className="mt-1 flex-row items-center justify-between">
            <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4) }}>
              {formatDate(hosting.createdAt)}
            </ThemedText>
            <View className="flex-row items-center gap-1.5">
              <MynauiStarSolid color={colors.primary} size={14} />
              <View className="flex-row items-center gap-1">
                <ThemedText
                  style={{
                    fontFamily: Fonts.semibold,
                    fontSize: 13,
                    color: colors.text,
                  }}
                >
                  {hosting.averageRating?.toFixed(1) ?? '0.0'}
                </ThemedText>
                <ThemedText
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.5),
                  }}
                >
                  ({hosting.totalRatings ?? '0'})
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default HostingCard;

export const HostingCardSkeleton = () => {
  return (
    <View className="gap-2">
      <Skeleton style={{ height: 290, borderRadius: 12 }} />
      <Skeleton style={{ height: 85, borderRadius: 12 }} />
    </View>
  );
};

export const HostingDetailsSkeleton = () => {
  const colors = useThemeColors();

  return (
    <View className="gap-8">
      {/* Carousel Area */}
      <Skeleton style={{ height: 290, borderRadius: 12 }} />

      <View className="gap-4">
        {/* Title and Like Row */}
        <View className="flex-row items-center justify-between">
          <Skeleton style={{ height: 24, width: '60%', borderRadius: 4 }} />
          <Skeleton style={{ height: 24, width: 24, borderRadius: 12 }} />
        </View>

        {/* Location */}
        <Skeleton style={{ height: 16, width: '30%', borderRadius: 4 }} />

        {/* Rating Row */}
        <View className="flex-row items-center gap-2">
          <Skeleton style={{ height: 16, width: 16, borderRadius: 4 }} />
          <Skeleton style={{ height: 16, width: '20%', borderRadius: 4 }} />
        </View>

        {/* Description Section */}
        <View className="mt-8 border-b pb-8" style={{ borderColor: hexToRgba(colors.text, 0.1) }}>
          <Skeleton
            style={{
              height: 22,
              width: 120,
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
          <Skeleton
            style={{
              height: 14,
              width: '100%',
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <Skeleton
            style={{
              height: 14,
              width: '100%',
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <Skeleton style={{ height: 14, width: '80%', borderRadius: 4 }} />
        </View>

        {/* Host Section */}
        <View className="flex-row items-center gap-4 py-4">
          <Skeleton style={{ height: 50, width: 50, borderRadius: 25 }} />
          <View className="flex-1 gap-2">
            <Skeleton style={{ height: 16, width: '40%', borderRadius: 4 }} />
            <Skeleton style={{ height: 14, width: '30%', borderRadius: 4 }} />
          </View>
        </View>

        {/* Facilities Section */}
        <View className="mt-4 gap-4">
          <Skeleton style={{ height: 20, width: 100, borderRadius: 4 }} />
          <View className="flex-row gap-4">
            <Skeleton style={{ height: 40, width: 80, borderRadius: 8 }} />
            <Skeleton style={{ height: 40, width: 80, borderRadius: 8 }} />
            <Skeleton style={{ height: 40, width: 80, borderRadius: 8 }} />
          </View>
        </View>
      </View>
    </View>
  );
};
