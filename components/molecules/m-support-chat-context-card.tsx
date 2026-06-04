import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { useRouter } from '@/lib/hooks/use-router';
import { SupportChatQuery, SupportItemType } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  itemType?: SupportItemType | null;
  hosting?: SupportChatQuery['supportChat']['hosting'];
  booking?: SupportChatQuery['supportChat']['booking'];
  transaction?: SupportChatQuery['supportChat']['transaction'];
};

const SupportChatContextCard: React.FC<Props> = ({ itemType, hosting, booking, transaction }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Derive the relevant hosting for cover image / title
  const effectiveHosting = hosting ?? booking?.hosting ?? null;

  const handlePress = () => {
    if (itemType === SupportItemType.Hosting && hosting?.id) {
      router.push(`/hostings/${hosting.id}`);
    } else if (itemType === SupportItemType.Booking && booking?.id) {
      router.push(`/bookings/${booking.id}`);
    }
    // Transactions don't have a dedicated detail route accessible from here
  };

  const canNavigate =
    (itemType === SupportItemType.Hosting && !!hosting?.id) ||
    (itemType === SupportItemType.Booking && !!booking?.id);

  const renderContent = () => {
    if (itemType === SupportItemType.Transaction && transaction) {
      return (
        <View className="flex-1 justify-between py-1">
          <View className="gap-1">
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.45),
                fontFamily: Fonts.medium,
              }}
            >
              Transaction
            </ThemedText>
            <ThemedText style={{ fontSize: 16, fontFamily: Fonts.semibold }}>
              ₦{Number(transaction.amount ?? '0').toLocaleString()}
            </ThemedText>
          </View>
          <View className="mt-2 flex-row items-center gap-2">
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
            >
              <ThemedText style={{ fontSize: 12, fontFamily: Fonts.medium, color: colors.primary }}>
                {capitalize(transaction.status ?? '')}
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba(colors.text, 0.4),
                fontFamily: Fonts.regular,
              }}
            >
              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : ''}
            </ThemedText>
          </View>
        </View>
      );
    }

    if (itemType === SupportItemType.Booking && booking && effectiveHosting) {
      return (
        <View className="flex-1 justify-between py-1">
          <View className="gap-1">
            <ThemedText
              style={{
                fontSize: 12,
                color: hexToRgba(colors.text, 0.45),
                fontFamily: Fonts.medium,
              }}
            >
              Booking · {booking.bookingReference}
            </ThemedText>
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ fontSize: 15, fontFamily: Fonts.semibold }}
            >
              {effectiveHosting.title}
            </ThemedText>
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ color: hexToRgba(colors.text, 0.5), fontSize: 12 }}
            >
              {effectiveHosting.city}, {effectiveHosting.state}
            </ThemedText>
          </View>
          <View className="mt-2 flex-row items-center gap-2">
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
            >
              <ThemedText style={{ fontSize: 12, fontFamily: Fonts.medium, color: colors.primary }}>
                {capitalize(booking.status ?? '')}
              </ThemedText>
            </View>
            {canNavigate && (
              <ThemedText
                style={{ fontSize: 11, fontFamily: Fonts.medium, color: colors.primary }}
                className="underline"
              >
                View Details
              </ThemedText>
            )}
          </View>
        </View>
      );
    }

    // Default: Hosting
    if (effectiveHosting) {
      return (
        <View className="flex-1 justify-between py-1">
          <View className="gap-1">
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ fontSize: 16, fontFamily: Fonts.semibold }}
            >
              {effectiveHosting.title}
            </ThemedText>
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ color: hexToRgba(colors.text, 0.5), fontSize: 12 }}
            >
              {effectiveHosting.city}, {effectiveHosting.state}
            </ThemedText>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
            >
              <ThemedText style={{ fontSize: 14, fontFamily: Fonts.bold, color: colors.primary }}>
                ₦{Number(effectiveHosting.price ?? '0').toLocaleString()}
                <ThemedText
                  style={{ fontSize: 10, fontFamily: Fonts.medium, color: colors.primary }}
                >
                  {' '}
                  / {capitalize(effectiveHosting.paymentInterval ?? '')}
                </ThemedText>
              </ThemedText>
            </View>
            {canNavigate && (
              <ThemedText
                style={{ fontSize: 11, fontFamily: Fonts.medium, color: colors.primary }}
                className="underline"
              >
                View Details
              </ThemedText>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  const coverImageUrl = effectiveHosting?.coverImage?.asset.publicUrl ?? null;

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={canNavigate ? handlePress : undefined}
      className="flex-row gap-4 rounded-2xl border p-3"
      style={[
        {
          backgroundColor: colors['surface-01'],
          borderColor: hexToRgba(colors.text, 0.08),
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        },
        animatedStyle,
      ]}
    >
      {coverImageUrl && (
        <View className="h-24 w-24 overflow-hidden rounded-xl">
          <Image
            source={{ uri: coverImageUrl }}
            style={{ height: '100%', width: '100%' }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
      )}
      {renderContent()}
    </AnimatedPressable>
  );
};

export default SupportChatContextCard;
