import React from 'react';
import { View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import ThemedText from './a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  icon: LucideIcon;
  title: string;
  /** Optional right-aligned element (e.g. a "See all" link or count). */
  action?: React.ReactNode;
};

/**
 * The shared section header for detail screens — a soft primary icon chip + a
 * bold title. Gives each section a distinct, consistent anchor so grouped
 * content reads as separate blocks. Part of the soft/cloudy language.
 */
const SectionHeader: React.FC<Props> = ({ icon: Icon, title, action }) => {
  const colors = useThemeColors();
  return (
    <View className="mb-3.5 flex-row items-center gap-2.5">
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
      >
        <Icon size={15} color={colors.primary} />
      </View>
      <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 17, letterSpacing: -0.3, flex: 1 }}>
        {title}
      </ThemedText>
      {action}
    </View>
  );
};

export default SectionHeader;
