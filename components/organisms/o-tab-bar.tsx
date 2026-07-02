import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinkIcon } from '../icons/i-link';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';

type Props = BottomTabBarProps & {
  /** The route that swaps persona (guest↔host) — rendered as the inline amber button. */
  centerRouteName: string;
};

/**
 * Soft/cloudy floating tab bar. A borderless, icon-only OPAQUE surface that floats
 * over the content (absolutely positioned + `box-none` so the empty sides pass
 * touches through), lifted off the base with a soft shadow, an amber wash + glow
 * behind the active tab, and an inline amber centre button for the guest↔host
 * swap. Presentational only — emits the same `tabPress` the layouts already listen
 * for (scroll-to-top on re-press, preventDefault swap), reuses each screen's
 * tabBarIcon, and returns null on tablet (sidebar nav there).
 *
 * NB: uses an opaque surface, NOT expo-blur — the Android experimental BlurView
 * glitched sibling view rendering after navigation.
 */
const TabBar: React.FC<Props> = ({ state, descriptors, navigation, centerRouteName }) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { isTablet } = useBreakpoint();

  if (isTablet) return null;

  const muted = hexToRgba(colors.text, 0.5);

  const press = (routeKey: string, routeName: string, focused: boolean) => () => {
    Haptics.selectionAsync();
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(routeName);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 14),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: 64,
          borderRadius: 30,
          paddingHorizontal: 6,
          backgroundColor: colors.surface,
          boxShadow: SURFACE.shadowHigh,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          // Centre slot: the persona-swap button — an inline amber circle.
          if (route.name === centerRouteName) {
            return (
              <Pressable
                key={route.key}
                onPress={press(route.key, route.name, focused)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                    boxShadow: SURFACE.glow,
                  }}
                >
                  <LinkIcon size={22} color={colors['primary-content']} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={press(route.key, route.name, focused)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <View
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  borderRadius: 999,
                  backgroundColor: focused ? hexToRgba(colors.primary, 0.15) : 'transparent',
                  boxShadow: focused ? SURFACE.glow : undefined,
                }}
              >
                {options.tabBarIcon?.({ focused, color: focused ? colors.primary : muted, size: 24 })}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;
