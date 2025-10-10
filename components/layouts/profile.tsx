import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "../atoms/a-themed-view";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Logo from "../icons/i-logo";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import BackButton from "../atoms/a-backbutton";
import { ChevronLeft } from "lucide-react-native";
import { IonNotificationsOutline } from "../icons/i-notifications";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

type Props = {
  children?: React.ReactNode;
};

const ProfileLayout: React.FC<Props> = ({ children }) => {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="p-5 flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => router.back()}
                  aria-label="Go Back"
                  className="w-8 items-center justify-center rounded-full h-8"
                  style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
                >
                  <ChevronLeft color={colors["text"]} />
                </Pressable>
                <View>
                  <ThemedText>Naruto Uzumaki</ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: hexToRgba(colors["text"], 0.7),
                    }}
                  >
                    Find your perfect home
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <IonNotificationsOutline
                  color={hexToRgba(colors["text"], 0.7)}
                />
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
              </View>
            </View>
            <View className="flex-1">{children}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ProfileLayout;
