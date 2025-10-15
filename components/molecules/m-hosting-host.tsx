import { Hosting } from "@/lib/constants/mocks/hostings";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { CuidaBuildingOutline } from "../icons/i-home";
import { TablerMessage2 } from "../icons/i-message";
import { SolarPhoneOutline } from "../icons/i-phone";
import { Fonts } from "@/lib/constants/theme";

type Props = {
  hosting?: Hosting;
};

const HostingHost: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  return (
    <View
      className="pb-8 gap-4 border-b"
      style={{
        borderColor: hexToRgba(colors.text, 0.1),
      }}
    >
      <ThemedText
        className="mt-4"
        style={{ fontFamily: Fonts.medium, fontSize: 18 }}
      >
        Host
      </ThemedText>
      <View
        className="p-6 gap-4 overflow-hidden rounded-xl"
        style={{
          backgroundColor: hexToRgba(colors.text, 0.1),
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full border overflow-hidden"
              style={{
                borderColor: hexToRgba(colors["text"], 0.6),
                borderWidth: 2,
              }}
            >
              <Image
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                source={{
                  uri: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk",
                }}
              />
            </View>
            <ThemedText>{hosting?.createdBy}</ThemedText>
          </View>
          <View className="flex-row items-center gap-2">
            <CuidaBuildingOutline color={colors.accent} />
            <ThemedText>{hosting?.creatorYears} years</ThemedText>
          </View>
        </View>
        <View className="flex-row gap-4 items-center">
          <Pressable
            className="flex-1 rounded items-center p-1 justify-center"
            aria-label="Message"
            style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
          >
            <TablerMessage2 color={colors.accent} />
          </Pressable>
          <Pressable
            className="flex-1 rounded items-center p-1 justify-center"
            aria-label="Call"
            style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
          >
            <SolarPhoneOutline color={colors.accent} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default HostingHost;
