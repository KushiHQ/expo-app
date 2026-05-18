import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { useRouter } from 'expo-router';
import { HostingChatQuery } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';

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
      onPressIn={() => (messageScale.value = withSpring(0.98))}
      onPressOut={() => (messageScale.value = withSpring(1))}
      onPress={() => router.push(`/hostings/${hosting?.id}`)}
      className="flex-row gap-4 rounded-2xl border p-3"
      style={[
        {
          backgroundColor: colors['surface-01'],
          borderColor: hexToRgba(colors.text, 0.08),
          // Subtle shadow for depth
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      <View className="h-24 w-24 overflow-hidden rounded-xl">
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
      <View className="flex-1 justify-between py-1">
        <View className="gap-1">
          <ThemedText
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{ fontSize: 16, fontFamily: Fonts.semibold }}
          >
            {hosting?.title}
          </ThemedText>
          <ThemedText
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{ color: hexToRgba(colors.text, 0.5), fontSize: 12 }}
          >
            {hosting?.city}, {hosting?.state}
          </ThemedText>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <View
            className="rounded-lg px-2 py-1"
            style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                fontFamily: Fonts.bold,
                color: colors.primary,
              }}
            >
              ₦{Number(hosting?.price ?? '0').toLocaleString()}
              <ThemedText
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.medium,
                  color: colors.primary,
                }}
              >
                {' '}
                / {capitalize(hosting?.paymentInterval ?? '')}
              </ThemedText>
            </ThemedText>
          </View>
          <ThemedText
            style={{
              fontSize: 11,
              fontFamily: Fonts.medium,
              color: colors.primary,
            }}
            className="underline"
          >
            View Details
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default HostingChatSummaryCard;
