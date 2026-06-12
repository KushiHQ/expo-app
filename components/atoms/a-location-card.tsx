import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Pressable, View } from 'react-native';
import ExpoMap from './a-map';
import React from 'react';
import { openGoogleMaps } from '@/lib/utils/urls';
import { MaterialSymbolsExpandContentRounded } from '../icons/i-fullscreen';
import { useRouter } from '@/lib/hooks/use-router';
import { ArrowBendUpRightBold } from '../icons/i-directions';

type Props = {
  location?: {
    longitude: number;
    latitude: number;
  };
  title?: string | null;
  zoom?: number;
  hostingId?: string;
  price?: number;
};

const LocationCard: React.FC<Props> = ({ location, title, zoom, hostingId, price }) => {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="relative overflow-hidden rounded-xl border" style={{ height: 250 }}>
      <ExpoMap title={title ?? undefined} coordinates={location} zoom={zoom ?? 6} />
      <View className="absolute right-2 top-2 flex-row items-center gap-4">
        {location && (
          <Pressable
            onPress={() => openGoogleMaps(location)}
            className="flex-row items-center justify-center rounded-2xl p-1 px-3"
            style={{ backgroundColor: colors.text }}
          >
            <ArrowBendUpRightBold size={22} color={colors.background} />
          </Pressable>
        )}
        <Pressable
          onPress={() =>
            router.push(
              `/hostings/map?latitude=${location?.latitude}&longitude=${location?.longitude}&zoom=${zoom ?? 6}${hostingId ? `&hostingId=${hostingId}&title=${encodeURIComponent(title ?? '')}&price=${price ?? 0}` : ''}`,
            )
          }
          className="items-center justify-center rounded-2xl p-1 px-3"
          style={{ backgroundColor: colors.text }}
        >
          <MaterialSymbolsExpandContentRounded size={24} color={colors.background} />
        </Pressable>
      </View>
    </View>
  );
};

export default LocationCard;
