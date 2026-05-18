import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { BOOKING_APPLICATION_STATUS_COLORS } from '@/lib/constants/booking/application';
import { hexToRgba } from '@/lib/utils/colors';
import { toTitleCase } from '@/lib/utils/text';
import { BookingApplication } from '@/lib/services/graphql/generated';

type Props = {
  application: Partial<BookingApplication>;
};

const BookingApplicationCard: React.FC<Props> = ({ application }) => {
  const router = useRouter();
  const colors = useThemeColors();

  if (!application) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/users/booking-applications/${application.id}`)}
      className="mb-4 rounded-2xl border p-4"
      style={{
        borderColor: hexToRgba(colors.text, 0.1),
        backgroundColor: hexToRgba(colors.text, 0.02),
      }}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <View>
          <ThemedText type="semibold" style={{ fontSize: 16 }}>
            Application #{application.id?.slice(-6).toUpperCase()}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 12,
              color: hexToRgba(colors.text, 0.6),
            }}
          >
            Submitted on{' '}
            {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : ''}
          </ThemedText>
        </View>
        {application.status && (
          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: hexToRgba(
                BOOKING_APPLICATION_STATUS_COLORS[application.status],
                0.1,
              ),
            }}
          >
            <ThemedText
              style={{
                fontSize: 12,
                color: BOOKING_APPLICATION_STATUS_COLORS[application.status],
              }}
            >
              {toTitleCase(application.status.replace(/_/g, ' '))}
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={{ fontSize: 14 }}>Guest: {application.fullName}</ThemedText>
    </TouchableOpacity>
  );
};

export default BookingApplicationCard;
