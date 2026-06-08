import ThemedText from '@/components/atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { HostingVerificationRequestStatus } from '@/lib/services/graphql/generated';
import { VERIFICATION_STATUS_CONFIG } from '@/lib/utils/verification/status';
import { View } from 'react-native';
import React from 'react';

type Props = {
  status: HostingVerificationRequestStatus;
  /** Compact mode shrinks the pill to icon-only at very small sizes. */
  size?: 'sm' | 'md';
};

const StatusPill: React.FC<Props> = ({ status, size = 'md' }) => {
  const colors = useThemeColors();
  const config = VERIFICATION_STATUS_CONFIG[status];
  const Icon = config.Icon;

  // Map the container/accent class to a hex color for the icon + label,
  // since `className` only applies via NativeWind's compiled styles.
  const accent = statusAccent(config.accentClass);

  const paddingH = size === 'sm' ? 8 : 12;
  const paddingV = size === 'sm' ? 3 : 6;
  const iconSize = size === 'sm' ? 10 : 12;
  const fontSize = size === 'sm' ? 10 : 11;

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full ${config.containerClass}`}
      style={{ paddingHorizontal: paddingH, paddingVertical: paddingV }}
    >
      <Icon size={iconSize} color={accent} />
      <ThemedText
        style={{
          fontSize,
          fontFamily: Fonts.semibold,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {config.label}
      </ThemedText>
    </View>
  );
};

function statusAccent(accentClass: string): string {
  if (accentClass.includes('yellow')) return '#EAB308';
  if (accentClass.includes('blue')) return '#3B82F6';
  if (accentClass.includes('green')) return '#22C55E';
  if (accentClass.includes('red')) return '#EF4444';
  return '#94A3B8';
}

export default StatusPill;
