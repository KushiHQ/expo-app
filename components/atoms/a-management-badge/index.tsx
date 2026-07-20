import React from 'react';
import { View } from 'react-native';
import ThemedText from '../a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { ManagementType } from '@/lib/services/graphql/generated';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  managementType?: ManagementType | null;
  /** `overlay` for use on top of an image (card); `surface` on a page. */
  variant?: 'overlay' | 'surface';
};

// Only agent-managed listings are badged (in the brand orange) — Kushi-managed
// is the default and stays unlabeled.
const ManagementBadge: React.FC<Props> = ({ managementType, variant = 'surface' }) => {
  const colors = useThemeColors();
  if (managementType !== ManagementType.AgentManaged) return null;
  const overlay = variant === 'overlay';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: overlay ? 'rgba(0,0,0,0.55)' : hexToRgba(colors.primary, 0.14),
      }}
    >
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: overlay ? '#fff' : colors.primary }}
      />
      <ThemedText
        style={{
          fontSize: 11,
          fontFamily: Fonts.semibold,
          letterSpacing: 0.3,
          color: overlay ? '#fff' : colors.primary,
        }}
      >
        Agent Managed
      </ThemedText>
    </View>
  );
};

export default ManagementBadge;
