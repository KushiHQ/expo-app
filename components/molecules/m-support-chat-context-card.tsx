import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { useRouter } from '@/lib/hooks/use-router';
import { SupportChatQuery, SupportItemType } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';
import { SURFACE } from '@/lib/constants/surface';

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

  // Map a booking/transaction status string to a semantic accent colour for its pill.
  const statusColorFor = (status?: string | null): string => {
    const s = (status ?? '').toUpperCase();
    if (['PAID', 'COMPLETED', 'SUCCESS', 'REFUNDED'].includes(s)) return colors.success;
    if (['PENDING', 'PROCESSING'].includes(s)) return colors.warning;
    if (['CANCELED', 'CANCELLED', 'FAILED', 'NEEDS_RECONCILIATION'].includes(s)) return colors.error;
    return colors.primary;
  };

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

  const StatusPill: React.FC<{ status?: string | null }> = ({ status }) => {
    const statusColor = statusColorFor(status);
    return (
      <View
        className="rounded-full px-3 py-1"
        style={{ backgroundColor: hexToRgba(statusColor, 0.16) }}
      >
        <ThemedText style={{ fontSize: 12, fontFamily: Fonts.semibold, color: statusColor }}>
          {capitalize(status ?? '')}
        </ThemedText>
      </View>
    );
  };

  const ViewDetailsLink = () =>
    canNavigate ? (
      <ThemedText style={{ fontSize: 12, fontFamily: Fonts.semibold, color: colors.primary }}>
        View Details
      </ThemedText>
    ) : null;

  const renderContent = () => {
    if (itemType === SupportItemType.Transaction && transaction) {
      return (
        <View className="flex-1 justify-between py-0.5">
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
            <StatusPill status={transaction.status} />
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba(colors.text, 0.45),
                fontFamily: Fonts.medium,
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
        <View className="flex-1 justify-between py-0.5">
          <View className="gap-1.5">
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
                {effectiveHosting.city}, {effectiveHosting.state}
              </ThemedText>
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-between gap-2">
            <StatusPill status={booking.status} />
            <ViewDetailsLink />
          </View>
        </View>
      );
    }

    // Default: Hosting
    if (effectiveHosting) {
      return (
        <View className="flex-1 justify-between py-0.5">
          <View className="gap-1.5">
            <ThemedText
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{ fontSize: 16, fontFamily: Fonts.semibold }}
            >
              {effectiveHosting.title}
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
                {effectiveHosting.city}, {effectiveHosting.state}
              </ThemedText>
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-between gap-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
            >
              <ThemedText style={{ fontSize: 14, fontFamily: Fonts.bold, color: colors.primary }}>
                ₦{Number(effectiveHosting.price ?? '0').toLocaleString()}
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontFamily: Fonts.medium,
                    color: hexToRgba(colors.primary, 0.75),
                  }}
                >
                  {' '}
                  / {capitalize(effectiveHosting.paymentInterval ?? '')}
                </ThemedText>
              </ThemedText>
            </View>
            <ViewDetailsLink />
          </View>
        </View>
      );
    }

    return null;
  };

  const coverImageUrl = effectiveHosting?.coverImage?.asset.publicUrl ?? null;

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.98, { damping: 10, stiffness: 100 }))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={canNavigate ? handlePress : undefined}
      className="flex-row gap-3.5 rounded-[20px] p-2.5"
      style={[
        {
          backgroundColor: hexToRgba(colors.text, 0.05),
          boxShadow: SURFACE.shadow,
        },
        animatedStyle,
      ]}
    >
      {coverImageUrl && (
        <View className="h-[92px] w-[104px] overflow-hidden rounded-2xl">
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
