import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import ThemedText from '../atoms/a-themed-text';
import { LinkIcon } from '../icons/i-link';
import { Image } from 'expo-image';
import LogoLarge from '@/assets/vectors/logo-large.svg';

export const SIDEBAR_WIDTH = 220;

export interface SidebarNavItem {
  name: string;
  label: string;
  route: string;
  renderIcon: (color: string) => React.ReactNode;
}

interface Props {
  items: SidebarNavItem[];
  mode: 'guest' | 'host';
  onModeSwitch: () => void;
}

const SidebarNav: React.FC<Props> = ({ items, mode, onModeSwitch }) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const activeTab = segments[1] as string;

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.background,
          borderRightColor: hexToRgba(colors.text, 0.06),
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View className="p-4">
        <LogoLarge />
      </View>
      <View style={styles.navItems}>
        {items.map((item) => {
          const isActive = activeTab === item.name;
          const iconColor = isActive ? colors.primary : hexToRgba(colors.text, 0.45);

          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: hexToRgba(colors.primary, 0.08),
                },
              ]}
            >
              {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
              <View style={styles.navItemInner}>
                {item.renderIcon(iconColor)}
                <ThemedText
                  style={[
                    styles.navLabel,
                    {
                      color: isActive ? colors.text : hexToRgba(colors.text, 0.5),
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onModeSwitch}
        style={[styles.modeSwitch, { borderTopColor: hexToRgba(colors.text, 0.07) }]}
      >
        <View style={[styles.modeSwitchIcon, { backgroundColor: hexToRgba(colors.text, 0.08) }]}>
          <LinkIcon size={16} color={hexToRgba(colors.text, 0.6)} />
        </View>
        <ThemedText style={[styles.modeSwitchLabel, { color: hexToRgba(colors.text, 0.45) }]}>
          {mode === 'guest' ? 'Switch to Host' : 'Switch to Guest'}
        </ThemedText>
      </Pressable>
    </View>
  );
};

export default SidebarNav;

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    flexDirection: 'column',
  },
  brand: {
    fontSize: 22,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  navItems: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 8,
  },
  navItem: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  navItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  navLabel: {
    fontSize: 15,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginHorizontal: 8,
    borderTopWidth: 1,
  },
  modeSwitchIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitchLabel: {
    fontSize: 13,
  },
});
