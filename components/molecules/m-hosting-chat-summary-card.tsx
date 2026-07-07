import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { joinLocation } from '@/lib/utils/locations';
import { Fonts } from '@/lib/constants/theme';
import { useRouter } from '@/lib/hooks/use-router';
import { HostingChatQuery } from '@/lib/services/graphql/generated';
import { formatPaymentInterval } from '@/lib/utils/hosting/interval';
import { abbreviateNumber } from '@/lib/utils/number';
import { SURFACE } from '@/lib/constants/surface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  hosting?: HostingChatQuery['hostingChat']['hosting'];
};

const HostingChatSummaryCard: React.FC<Props> = ({ hosting }) => {
  const router = useRouter();
  const colors = useThemeColors();

  const messageScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (messageScale.value = withSpring(0.98, { damping: 10, stiffness: 100 }))}
      onPressOut={() => (messageScale.value = withSpring(1))}
      onPress={() => router.push(`/hostings/${hosting?.id}`)}
      className="flex-row gap-3.5 rounded-[20px] p-2.5"
      style={[
        {
          backgroundColor: hexToRgba(colors.text, 0.05),
          boxShadow: SURFACE.shadow,
        },
        animatedStyle,
      ]}
    >
      <View className="h-[92px] w-[104px] overflow-hidden rounded-2xl">
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
      <View className="flex-1 justify-between py-0.5">
        <View className="gap-1.5">
          <ThemedText
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{ fontSize: 16, fontFamily: Fonts.semibold }}
          >
            {hosting?.title}
          </ThemedText>
          <View className="flex-row items-center gap-1.5">
            <MapPin size={12} color={hexToRgba(colors.text, 0.45)} />
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              className="flex-1"
              style={{
                color: hexToRgba(colors.text, 0.6),
                fontSize: 13,
                fontFamily: Fonts.medium,
              }}
            >
              {joinLocation(hosting?.city, hosting?.state)}
            </ThemedText>
          </View>
        </View>
        <View className="mt-2 flex-row items-center justify-between gap-2">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                fontFamily: Fonts.bold,
                color: colors.primary,
              }}
            >
              ₦{abbreviateNumber(Number(hosting?.price ?? 0))}
              {formatPaymentInterval(hosting?.paymentInterval) ? (
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontFamily: Fonts.medium,
                    color: hexToRgba(colors.primary, 0.75),
                  }}
                >
                  {' '}
                  / {formatPaymentInterval(hosting?.paymentInterval)}
                </ThemedText>
              ) : null}
            </ThemedText>
          </View>
          <ThemedText
            style={{
              fontSize: 12,
              fontFamily: Fonts.semibold,
              color: colors.primary,
            }}
          >
            View Details
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default HostingChatSummaryCard;
