import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import Button from '../atoms/a-button';
import { ChevronDown, MapPin } from 'lucide-react-native';
import { IconParkOutlineDot } from '../icons/i-circle';
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
      : bookingStatus === 'active'
        ? colors.success
        : colors.error;

  const location = [booking.hosting.city, booking.hosting.state].filter(Boolean).join(', ');

  return (
    <>
      <View className="gap-3">
        <Pressable
          onPress={() => router.push(`/bookings/${booking.id}`)}
          className="flex-row items-center gap-3.5 rounded-[20px] p-2.5"
          style={{
            backgroundColor: hexToRgba(colors.text, 0.05),
            boxShadow: SURFACE.shadow,
          }}
        >
          <View className="h-[92px] w-[104px] overflow-hidden rounded-2xl">
            <Image
              source={{
                uri: booking.hosting.coverImage?.asset.publicUrl,
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
              {booking.hosting.title}
            </ThemedText>
            {location ? (
              <View className="flex-row items-center gap-1.5">
                <MapPin size={12} color={hexToRgba(colors.text, 0.45)} />
                <ThemedText
                  numberOfLines={1}
                  className="flex-1"
                  style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6), fontFamily: Fonts.medium }}
                >
                  {location}
                </ThemedText>
              </View>
            ) : null}
            <View className="mt-0.5 flex-row items-center justify-between gap-2">
              <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 14 }}>
                ₦{Number(booking.amount ?? '0').toLocaleString()}
                {formatPaymentInterval(booking.hosting.paymentInterval) ? (
                  <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 12, color: hexToRgba(colors.text, 0.5) }}>
                    {' '}
                    {formatPaymentInterval(booking.hosting.paymentInterval)}
                  </ThemedText>
                ) : null}
              </ThemedText>
              <View
                className="flex-row items-center gap-1.5 rounded-full px-2 py-0.5"
                style={{ backgroundColor: hexToRgba(statusColor, 0.16) }}
              >
                <IconParkOutlineDot color={statusColor} size={8} />
                <ThemedText
                  style={{ fontSize: 11, color: statusColor, fontFamily: Fonts.semibold }}
                >
                  {capitalize(bookingStatus)}
                </ThemedText>
              </View>
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
