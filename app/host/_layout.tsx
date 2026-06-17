import { MajesticonsAnalytics, MajesticonsAnalyticsLine } from '@/components/icons/i-analytics';
import { LinkIcon } from '@/components/icons/i-link';
import { FluentAppsList24Filled, FluentAppsList24Regular } from '@/components/icons/i-list';
import { TablerMessage2, TablerMessage2Filled } from '@/components/icons/i-message';
import { MingcuteUser3Fill, MingcuteUser3Line } from '@/components/icons/i-user';
import SidebarNav, { type SidebarNavItem } from '@/components/organisms/o-sidebar-nav';
import AuthGuard from '@/components/guards/auth-guard';
import React from 'react';
import { Fonts } from '@/lib/constants/theme';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { UserType } from '@/lib/types/users';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Anchor the tab group to analytics so a cold start / restored navigation state
// can't strand the user on a tab root (e.g. profile) with no way back.
export const unstable_settings = { initialRouteName: 'analytics' };

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    name: 'analytics',
    label: 'Analytics',
    route: '/host/analytics',
    renderIcon: (color) => <MajesticonsAnalyticsLine color={color} size={22} />,
  },
  {
    name: 'listings',
    label: 'Listings',
    route: '/host/listings',
    renderIcon: (color) => <FluentAppsList24Regular color={color} size={22} />,
  },
  {
    name: 'chat',
    label: 'Chat',
    route: '/host/chat',
    renderIcon: (color) => <TablerMessage2 color={color} size={22} />,
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

  const currentTab = segments[1];

  const insets = useSafeAreaInsets();

  const [tabBarBottomInset, setTabBarBottomInset] = React.useState(0);
  React.useEffect(() => {
    if (insets.bottom > 0 && tabBarBottomInset === 0) {
      setTabBarBottomInset(insets.bottom);
    }
  }, [insets.bottom, tabBarBottomInset]);

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
        tabBarStyle: isTablet
          ? { display: 'none' }
          : {
              height: 80 + tabBarBottomInset,
              backgroundColor: colors['background'],
              borderTopColor: '#0000',
              borderTopWidth: 1,
            },
        tabBarLabelStyle: {
          fontSize: 14,
          paddingTop: 2,
        },
        animation: 'fade',
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
              <MajesticonsAnalytics color={color} size={size} />
            ) : (
              <MajesticonsAnalyticsLine color={color} size={size} />
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
              <FluentAppsList24Filled color={color} size={size} />
            ) : (
              <FluentAppsList24Regular color={color} size={size} />
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
          tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 16, paddingTop: 8 },
          tabBarIcon: () => (
            <View style={{ backgroundColor: colors['text'] }} className="mt-6 rounded-full p-[5px]">
              <LinkIcon size={28} color={colors['background']} />
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
              <TablerMessage2Filled color={color} size={size} />
            ) : (
              <TablerMessage2 color={color} size={size} />
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
        </View>
      </AuthGuard>
    );
  }

  return <AuthGuard>{tabs}</AuthGuard>;
}
