import { PROPERTY_BLURHASH, FALLBACK_IMAGE } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import Hairline from '../atoms/a-hairline';
import ImageScrim from '../atoms/a-image-scrim';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import Button from '../atoms/a-button';
import { ChevronDown, MapPin } from 'lucide-react-native';
import BookingDetailsSheet from './m-booking-details';
import { BookingsQuery } from '@/lib/services/graphql/generated';
import { capitalize } from '@/lib/utils/text';
import { formatPaymentInterval } from '@/lib/utils/hosting/interval';
import { getBookingStatus } from '@/lib/utils/bookings';
import { useRouter } from '@/lib/hooks/use-router';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  booking: BookingsQuery['bookings'][number];
};

const BookingCard: React.FC<Props> = ({ booking }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [open, setOpen] = React.useState(false);

  const bookingStatus = getBookingStatus(booking);
  const statusColor =
    bookingStatus === 'pending'
      ? colors.accent
      : bookingStatus === 'active' || bookingStatus === 'paid'
        ? colors.success
        : colors.error;

  const location = [booking.hosting.city, booking.hosting.state].filter(Boolean).join(', ');
  const interval = formatPaymentInterval(booking.hosting.paymentInterval);
  const coverUrl = booking.hosting.coverImage?.asset.publicUrl;

  return (
    <>
      <View className="gap-3">
        <Pressable
          onPress={() => router.push(`/bookings/${booking.id}`)}
          style={{
            borderRadius: SURFACE.radius,
            backgroundColor: hexToRgba(colors.text, SURFACE.fillRaised),
            overflow: 'hidden',
            boxShadow: SURFACE.shadow,
          }}
        >
          {/* Cover */}
          <View style={{ width: '100%', height: 132 }}>
            <Image
              source={coverUrl ? { uri: coverUrl } : FALLBACK_IMAGE}
              style={{ height: '100%', width: '100%' }}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
            <ImageScrim from="top" intensity={0.45} height="65%" />
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: hexToRgba(statusColor, 0.18),
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
              <ThemedText style={{ fontSize: 11, color: statusColor, fontFamily: Fonts.bold }}>
                {capitalize(bookingStatus)}
              </ThemedText>
            </View>
          </View>

          {/* Body */}
          <View style={{ padding: 14, gap: 10 }}>
            <View style={{ gap: 4 }}>
              <ThemedText numberOfLines={1} style={{ fontSize: 16, fontFamily: Fonts.semibold }}>
                {booking.hosting.title}
              </ThemedText>
              {location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color={hexToRgba(colors.text, 0.4)} />
                  <ThemedText numberOfLines={1} style={{ fontSize: 12.5, color: hexToRgba(colors.text, 0.5) }}>
                    {location}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <Hairline />

            {/* Meta footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 16, color: colors.primary }}>
                ₦{Number(booking.amount ?? '0').toLocaleString()}
                {interval ? (
                  <ThemedText
                    style={{ fontFamily: Fonts.medium, fontSize: 11, color: hexToRgba(colors.text, 0.5) }}
                  >
                    {' '}
                    {interval}
                  </ThemedText>
                ) : null}
              </ThemedText>
              {booking.commencementDate ? (
                <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.4) }}>
                  {new Date(booking.commencementDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </ThemedText>
              ) : null}
            </View>
          </View>
        </Pressable>

        <Button onPress={() => setOpen(true)} type="tinted" style={{ paddingVertical: 10 }}>
          <View className="flex-row items-center gap-2">
            <ThemedText content="tinted">View Receipt</ThemedText>
            <ChevronDown color={colors.primary} size={16} />
          </View>
        </Button>
      </View>
      <BookingDetailsSheet open={open} onOpenChange={setOpen} booking={booking} />
    </>
  );
};

export default BookingCard;
