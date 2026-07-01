import React from 'react';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import SectionHeader from '@/components/atoms/a-section-header';
import { Sparkles } from 'lucide-react-native';
import { SimpleGrid } from 'react-native-super-grid';
import { FACILITY_ICONS, FALLBACK_FACILITY_ICON } from '@/lib/types/enums/hosting-icons';
import { cast } from '@/lib/types/utils';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HostingQuery } from '@/lib/services/graphql/generated';

type Props = {
  hosting?: HostingQuery['hosting'];
};

const HostingFacilities: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View className="mt-8">
      <SectionHeader icon={Sparkles} title="Facilities" />
      <SimpleGrid
        listKey={undefined}
        itemDimension={80}
        data={hosting?.facilities ?? []}
        renderItem={({ item }) => {
          const Icon =
            FACILITY_ICONS[cast<keyof typeof FACILITY_ICONS>(item)] ?? FALLBACK_FACILITY_ICON;
          return (
            <View className="items-center justify-center py-1">
              <View
                className="h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: hexToRgba(colors.primary, 0.3) }}
              >
                <Icon color={colors.primary} size={14} />
              </View>
              <ThemedText numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 12 }}>
                {item}
              </ThemedText>
            </View>
          );
        }}
      />
    </View>
  );
};

export default HostingFacilities;
