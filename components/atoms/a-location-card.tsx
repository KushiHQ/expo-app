import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Pressable, View } from "react-native";
import ExpoMap from "./a-map";
import React from "react";
import { openGoogleMaps } from "@/lib/utils/urls";
import { PhCompassRoseDuotone } from "../icons/i-map";
import { MaterialSymbolsExpandContentRounded } from "../icons/i-fullscreen";
import { useRouter } from "expo-router";

type Props = {
  location?: {
    longitude: number;
    latitude: number;
  };
  title?: string;
  zoom?: number;
};

const LocationCard: React.FC<Props> = ({ location, title, zoom }) => {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View
      className="relative border rounded-xl overflow-hidden"
      style={{ borderColor: colors.text, height: 250 }}
    >
      <ExpoMap title={title} coordinates={location} zoom={zoom ?? 6} />
      <View className="absolute top-2 right-2 items-center gap-4 flex-row">
        {location && (
          <Pressable
            onPress={() => openGoogleMaps(location)}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.text }}
          >
            <PhCompassRoseDuotone size={24} color={colors.background} />
          </Pressable>
        )}
        <Pressable
          onPress={() =>
            router.push(
              `/hostings/map?latitude=${location?.latitude}&longitude=${location?.longitude}&zoom=${zoom ?? 6}`,
            )
          }
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.text }}
        >
          <MaterialSymbolsExpandContentRounded
            size={24}
            color={colors.background}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default LocationCard;
