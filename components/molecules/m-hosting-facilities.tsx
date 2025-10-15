import { Hosting } from "@/lib/constants/mocks/hostings";
import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { SimpleGrid } from "react-native-super-grid";
import { FACILITIES_BY_VARIANT } from "@/lib/types/enums/hostings";
import { FACILITY_ICONS } from "@/lib/types/enums/hosting-icons";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
  hosting?: Hosting;
};

const HostingFacilities: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View className="mt-8">
      <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
        Facilities
      </ThemedText>
      <SimpleGrid
        listKey={undefined}
        itemDimension={80}
        data={FACILITIES_BY_VARIANT.map((f) => f.facility)}
        renderItem={({ item }) => {
          const Icon = FACILITY_ICONS[cast<keyof typeof FACILITY_ICONS>(item)];
          return (
            <View className="items-center justify-center py-1">
              <View
                className="w-6 h-6 items-center justify-center rounded-full"
                style={{ backgroundColor: hexToRgba(colors.primary, 0.3) }}
              >
                <Icon color={colors.primary} size={14} />
              </View>
              <ThemedText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontSize: 12 }}
              >
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
