import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from '@/lib/hooks/use-router';
import ThemedText from '@/components/atoms/a-themed-text';
import Hairline from '@/components/atoms/a-hairline';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { BOOKING_APPLICATION_STATUS_COLORS } from '@/lib/constants/booking/application';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { hexToRgba } from '@/lib/utils/colors';
import { toTitleCase } from '@/lib/utils/text';
import { getDefaultProfileImageUrl } from '@/lib/utils/urls';
import { BookingApplication } from '@/lib/services/graphql/generated';
import { Fonts } from '@/lib/constants/theme';
import { SURFACE } from '@/lib/constants/surface';
import { MapPin, ChevronRight } from 'lucide-react-native';
import ImageScrim from '../atoms/a-image-scrim';

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
      activeOpacity={0.85}
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
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          style={{ width: '100%', height: '100%' }}
        />
        <ImageScrim from="top" intensity={0.45} height="65%" />
        {application.status ? (
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
              {toTitleCase(application.status.replace(/_/g, ' '))}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText numberOfLines={1} style={{ fontSize: 16, fontFamily: Fonts.semibold }}>
              {application.hosting?.title ?? 'Property Application'}
            </ThemedText>
            {location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color={hexToRgba(colors.text, 0.4)} />
                <ThemedText style={{ fontSize: 12.5, color: hexToRgba(colors.text, 0.5) }}>
                  {location}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ChevronRight size={18} color={hexToRgba(colors.text, 0.25)} style={{ marginTop: 2 }} />
        </View>

        {host ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: hexToRgba(colors.text, 0.04),
              padding: 8,
              borderRadius: SURFACE.radiusSm,
            }}
          >
            <Image
              source={{
                uri:
                  application.guest?.user?.profile?.image?.publicUrl ||
                  getDefaultProfileImageUrl(
                    application.guest?.user?.profile?.fullName ?? application.fullName ?? 'Guest',
                  ),
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                backgroundColor: hexToRgba(colors.text, 0.1),
              }}
            />
            <ThemedText
              numberOfLines={1}
              style={{
                flex: 1,
                fontSize: 13,
                fontFamily: Fonts.semibold,
                color: hexToRgba(colors.text, 0.9),
              }}
            >
              {application.guest?.user?.profile?.fullName ?? application.fullName}
            </ThemedText>
          </View>
        ) : null}

        <Hairline />

        {/* Meta footer */}
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: hexToRgba(colors.text, 0.4),
              fontFamily: Fonts.medium,
              letterSpacing: 0.4,
            }}
          >
            REF #{application.id?.slice(-6).toUpperCase()}
          </ThemedText>
          <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.4) }}>
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
