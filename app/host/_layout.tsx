import { MajesticonsAnalytics, MajesticonsAnalyticsLine } from '@/components/icons/i-analytics';
import { LinkIcon } from '@/components/icons/i-link';
import { FluentAppsList24Filled, FluentAppsList24Regular } from '@/components/icons/i-list';
import { TablerMessage2, TablerMessage2Filled } from '@/components/icons/i-message';
import { MingcuteUser3Fill, MingcuteUser3Line } from '@/components/icons/i-user';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { UserType } from '@/lib/types/users';
import { EventEmitter } from '@/lib/utils/event-emitter';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
  const colors = useThemeColors();
  const router = useRouter();
  const segments = useSegments();
  const { updateUser } = useUser();

  const currentTab = segments[1];

  const insets = useSafeAreaInsets();

  const handleTabPress = (tabName: string) => (e: any) => {
    if (currentTab === tabName) {
      e.preventDefault();
      EventEmitter.emit(`scrollToTop:${tabName}`);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors['primary'],
        tabBarStyle: {
          height: 80 + insets.bottom,
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
        listeners={{
          tabPress: handleTabPress('analytics'),
        }}
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
        listeners={{
          tabPress: handleTabPress('listings'),
        }}
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
            updateUser({ userType: UserType.Guest });
            router.replace('/guest/home');
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
            <View style={{ backgroundColor: colors['text'] }} className="mt-6 rounded-full p-[5px]">
              <LinkIcon size={28} color={colors['background']} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        listeners={{
          tabPress: handleTabPress('chat'),
        }}
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
        listeners={{
          tabPress: handleTabPress('profile'),
        }}
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
}
