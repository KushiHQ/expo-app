import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import SectionHeader from '@/components/atoms/a-section-header';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { joinLocation } from '@/lib/utils/locations';
import LocationCard from '../atoms/a-location-card';
import { HostingQuery } from '@/lib/services/graphql/generated';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting?: HostingQuery['hosting'];
};

const HostingLocation: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View
      className="mt-8 gap-5 rounded-3xl p-5"
      style={{ backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow }}
    >
      <View className="gap-1">
        <SectionHeader icon={MapPin} title="Pin the Location" />
        <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 16 }}>
          {joinLocation(hosting?.city, hosting?.state, hosting?.country)}
        </ThemedText>
      </View>
      {hosting?.latitude ? (
        <LocationCard
          zoom={15}
          location={{
            longitude: Number(hosting.longitude),
            latitude: Number(hosting.latitude),
          }}
          title={hosting?.title}
          hostingId={hosting?.id}
          price={hosting?.price ? Number(hosting.price) : undefined}
        />
      ) : (
        // Agent-managed listings mask the exact location — only area is shown.
        <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.5) }}>
          The exact location is shared on request — message the agent to arrange a viewing.
        </ThemedText>
      )}
    </View>
  );
};

export default HostingLocation;
