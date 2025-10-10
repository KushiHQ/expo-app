import { PhHeart, PhHeartFill } from "@/components/icons/i-heart";
import { SolarHome2Bold, SolarHome2Linear } from "@/components/icons/i-home";
import { LinkIcon } from "@/components/icons/i-link";
import {
  TablerMessage2,
  TablerMessage2Filled,
} from "@/components/icons/i-message";
import {
  MingcuteUser3Fill,
  MingcuteUser3Line,
} from "@/components/icons/i-user";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Tabs, useRouter } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors["primary"],
        tabBarStyle: {
          backgroundColor: colors["background"],
          borderTopColor: "transparent",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          paddingTop: 2,
        },
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <SolarHome2Bold color={color} size={size} />
            ) : (
              <SolarHome2Linear color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerShown: false,
          tabBarLabel: "Saved",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <PhHeartFill color={color} size={size} />
            ) : (
              <PhHeart color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="host"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/host/home");
          },
        }}
        options={{
          headerShown: false,
          tabBarLabel: "Host",
          tabBarLabelStyle: {
            fontFamily: Fonts.semibold,
            fontSize: 16,
            paddingTop: 8,
          },
          tabBarIcon: () => (
            <View
              style={{ backgroundColor: colors["text"] }}
              className="rounded-full p-[5px] mt-2"
            >
              <LinkIcon size={28} color={colors["background"]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          tabBarLabel: "Chat",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <TablerMessage2Filled color={color} size={size} />
            ) : (
              <TablerMessage2 color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <MingcuteUser3Fill color={color} size={size} />
            ) : (
              <MingcuteUser3Line color={color} size={size} />
            ),
        }}
      />
    </Tabs>
  );
}
