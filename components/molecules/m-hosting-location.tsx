import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import SectionHeader from '@/components/atoms/a-section-header';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import LocationCard from '../atoms/a-location-card';
import { HostingQuery } from '@/lib/services/graphql/generated';

type Props = {
  hosting?: HostingQuery['hosting'];
};

const HostingLocation: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View className="mt-8 gap-6">
      <View className="gap-1">
        <SectionHeader icon={MapPin} title="Pin the Location" />
        <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 16 }}>
          {hosting?.city}, {hosting?.state}, {hosting?.country}
        </ThemedText>
      </View>
      <LocationCard
        zoom={15}
        location={
          hosting?.latitude && hosting.latitude
            ? {
                longitude: Number(hosting.longitude),
                latitude: Number(hosting.latitude),
              }
            : undefined
        }
        title={hosting?.title}
        hostingId={hosting?.id}
        price={hosting?.price ? Number(hosting.price) : undefined}
      />
    </View>
  );
};

export default HostingLocation;
