import { LinkIcon } from '@/components/icons/i-link';
import { MingcuteUser3Fill, MingcuteUser3Line } from '@/components/icons/i-user';
import SidebarNav, { type SidebarNavItem } from '@/components/organisms/o-sidebar-nav';
import AuthGuard from '@/components/guards/auth-guard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hexToRgba } from '@/lib/utils/colors';
import FeedbackHost from '@/components/organisms/o-feedback-host';
import React from 'react';
import { Fonts } from '@/lib/constants/theme';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { UserType } from '@/lib/types/users';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { MingCuteChatFill, MingCuteChatLine } from '@/components/icons/i-chat';
import { SolarChartBold, SolarChartLinear } from '@/components/icons/i-chart';
import { BiHouses, BiHousesFill } from '@/components/icons/i-home';

// Anchor the tab group to analytics so a cold start / restored navigation state
// can't strand the user on a tab root (e.g. profile) with no way back.
export const unstable_settings = { initialRouteName: 'analytics' };

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    name: 'analytics',
    label: 'Analytics',
    route: '/host/analytics',
    renderIcon: (color) => <SolarChartLinear color={color} size={22} />,
  },
  {
    name: 'listings',
    label: 'Listings',
    route: '/host/listings',
    renderIcon: (color) => <BiHouses color={color} size={22} />,
  },
  {
    name: 'chat',
    label: 'Chat',
    route: '/host/chat',
    renderIcon: (color) => <MingCuteChatLine color={color} size={22} />,
  },
  {
    name: 'profile',
    label: 'Profile',
    route: '/host/profile',
    renderIcon: (color) => <MingcuteUser3Line color={color} size={22} />,
  },
];

export default function Layout() {
  const colors = useThemeColors();
  const router = useRouter();
  const segments = useSegments();
  const { updateUser } = useUser();
  const { isTablet } = useBreakpoint();
  const insets = useSafeAreaInsets();

  const currentTab = segments[1];

  const handleTabPress = (tabName: string) => (e: any) => {
    if (currentTab === tabName) {
      e.preventDefault();
      EventEmitter.emit(`scrollToTop:${tabName}`);
    }
  };

  const handleSwitchToGuest = () => {
    updateUser({ userType: UserType.Guest });
    router.replace('/guest/home');
  };

  const tabs = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors['primary'],
        tabBarInactiveTintColor: hexToRgba(colors['text'], 0.45),
        tabBarShowLabel: false,
        animation: 'fade',
        tabBarStyle: isTablet
          ? { display: 'none' }
          : {
              height: 74 + insets.bottom,
              paddingTop: 14,
              backgroundColor: colors['background'],
              borderTopColor: hexToRgba(colors['text'], 0.06),
              borderTopWidth: 1,
            },
      }}
    >
      <Tabs.Screen
        name="analytics"
        listeners={{ tabPress: handleTabPress('analytics') }}
        options={{
          headerShown: false,
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <SolarChartBold color={color} size={size} />
            ) : (
              <SolarChartLinear color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="listings"
        listeners={{ tabPress: handleTabPress('listings') }}
        options={{
          headerShown: false,
          tabBarLabel: 'Listings',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <BiHousesFill color={color} size={size} />
            ) : (
              <BiHouses color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="guest"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleSwitchToGuest();
          },
        }}
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarLabelStyle: {
            fontFamily: Fonts.semibold,
            fontSize: 16,
            paddingTop: 8,
          },
          tabBarIcon: () => (
            <View style={{ backgroundColor: colors['primary'] }} className="rounded-full p-[7px]">
              <LinkIcon size={24} color={colors['primary-content']} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        listeners={{ tabPress: handleTabPress('chat') }}
        options={{
          headerShown: false,
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <MingCuteChatFill color={color} size={size} />
            ) : (
              <MingCuteChatLine color={color} size={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{ tabPress: handleTabPress('profile') }}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
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

  if (isTablet) {
    return (
      <AuthGuard>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <SidebarNav items={SIDEBAR_ITEMS} mode="host" onModeSwitch={handleSwitchToGuest} />
          <View style={{ flex: 1 }}>{tabs}</View>
          <FeedbackHost />
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {tabs}
      <FeedbackHost />
    </AuthGuard>
  );
}
