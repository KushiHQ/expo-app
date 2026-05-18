import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Star, MapPin, X, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { formatNaira } from '@/lib/utils/currency';
import { Hosting } from '@/lib/services/graphql/generated';

type Props = {
  hosting: Partial<Hosting>;
  onClose: () => void;
};

const HostingMapCard: React.FC<Props> = ({ hosting, onClose }) => {
  const colors = useThemeColors();
  const router = useRouter();

  if (!hosting) return null;

  const {
    id,
    title,
    city,
    state,
    price,
    averageRating,
    totalRatings,
    coverImage,
    paymentInterval,
  } = hosting;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(20).stiffness(150)}
      exiting={FadeOutDown}
      className="absolute bottom-10 left-5 right-5 overflow-hidden rounded-[24px] shadow-xl"
      style={{
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <View className="flex-row gap-3 p-3">
        <Image
          source={{ uri: coverImage?.asset?.publicUrl || '' }}
          className="h-24 w-24 rounded-2xl"
          contentFit="cover"
        />

        <View className="flex-1 justify-between py-1">
          <View>
            <View className="flex-row items-start justify-between">
              <ThemedText type="semibold" numberOfLines={1} className="flex-1 pr-2">
                {title}
              </ThemedText>
              <TouchableOpacity
                onPress={onClose}
                className="rounded-full p-1"
                style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
              >
                <X size={14} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={12} color={hexToRgba(colors.text, 0.6)} />
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
                {city}, {state}
              </ThemedText>
            </View>
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <View>
              <ThemedText type="semibold" style={{ color: colors.primary }}>
                {formatNaira(Number(price)).formated}
                <ThemedText style={{ fontSize: 10, color: hexToRgba(colors.text, 0.5) }}>
                  /{paymentInterval?.toLowerCase()}
                </ThemedText>
              </ThemedText>
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#FFB800" fill="#FFB800" />
                <ThemedText style={{ fontSize: 12 }}>
                  {averageRating?.toFixed(1) || '0.0'} ({totalRatings || 0})
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/hostings/${id}`)}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.primary }}
            >
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default HostingMapCard;
