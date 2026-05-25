import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from '@/lib/hooks/use-router';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { BOOKING_APPLICATION_STATUS_COLORS } from '@/lib/constants/booking/application';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { hexToRgba } from '@/lib/utils/colors';
import { toTitleCase } from '@/lib/utils/text';
import { BookingApplication } from '@/lib/services/graphql/generated';
import { Fonts } from '@/lib/constants/theme';
import { MapPin, ChevronRight } from 'lucide-react-native';

type Props = {
  host?: boolean;
  application: Partial<BookingApplication>;
};

const BookingApplicationCard: React.FC<Props> = ({ application, host }) => {
  const router = useRouter();
  const colors = useThemeColors();

  if (!application) return null;

  const statusColor = application.status
    ? BOOKING_APPLICATION_STATUS_COLORS[application.status]
    : hexToRgba(colors.text, 0.4);

  const coverUrl = application.hosting?.coverImage?.asset?.publicUrl;
  const location = [application.hosting?.city, application.hosting?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <TouchableOpacity
      onPress={() => {
        if (host) {
          router.push(
            `/hostings/${application.hosting?.id}/booking-applications/${application.id}`,
          );
        } else {
          router.push(`/users/booking-applications/${application.id}`);
        }
      }}
      activeOpacity={0.75}
      style={{
        borderRadius: 16,
        backgroundColor: colors['surface-01'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hexToRgba(colors.text, 0.06),
      }}
    >
      {/* Cover image */}
      <Image
        source={coverUrl ? { uri: coverUrl } : FALLBACK_IMAGE}
        placeholder={{ blurhash: PROPERTY_BLURHASH }}
        contentFit="cover"
        style={{ width: '100%', height: 110 }}
      />

      {/* Status pill overlay */}
      {application.status && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: hexToRgba(statusColor, 0.3),
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: hexToRgba(statusColor, 0.35),
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: statusColor,
              fontFamily: Fonts.semibold,
            }}
          >
            {toTitleCase(application.status.replace(/_/g, ' '))}
          </ThemedText>
        </View>
      )}

      {/* Body */}
      <View style={{ padding: 14, gap: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText numberOfLines={1} style={{ fontSize: 15, fontFamily: Fonts.semibold }}>
              {application.hosting?.title ?? 'Property Application'}
            </ThemedText>
            {location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} color={hexToRgba(colors.text, 0.38)} />
                <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.38) }}>
                  {location}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ChevronRight size={16} color={hexToRgba(colors.text, 0.22)} style={{ marginTop: 2 }} />
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: hexToRgba(colors.text, 0.06),
            marginVertical: 2,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: hexToRgba(colors.text, 0.35),
              fontFamily: Fonts.medium,
              letterSpacing: 0.4,
            }}
          >
            REF #{application.id?.slice(-6).toUpperCase()}
          </ThemedText>
          <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.35) }}>
            {application.createdAt
              ? new Date(application.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : ''}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookingApplicationCard;
