import React from 'react';
import { View } from 'react-native';
import { Award, ShieldCheck as CheckBadge } from 'lucide-react-native';
import ThemedText from './../a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { HostingVerificationTier } from '@/lib/services/graphql/generated';
import { formatTierLabel } from '@/lib/utils/verification/tier';
import Tooltip from '../a-tooltip';

type Props = {
  tier: HostingVerificationTier;
  size?: 'sm' | 'md';
  tooltipDescription?: string;
};

const TierBadge: React.FC<Props> = ({ tier, size = 'md', tooltipDescription }) => {
  const isKushiVetted = tier === HostingVerificationTier.KushiVetted;
  const isUnverified = tier === HostingVerificationTier.Unverified;

  const accentHex = isKushiVetted
    ? '#FFB020'
    : isUnverified
      ? 'rgba(255, 255, 255, 0.55)'
      : '#8AB4F8';
  const labelHex = isUnverified ? 'rgba(255, 255, 255, 0.75)' : '#FFFFFF';
  const containerBg = 'rgba(8, 8, 8, 0.9)';
  const paddingH = size === 'sm' ? 8 : 10;
  const paddingV = size === 'sm' ? 3 : 5;
  const iconSize = size === 'sm' ? 10 : 12;
  const fontSize = size === 'sm' ? 10 : 11;

  const badge = (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full"
      style={{
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
        backgroundColor: containerBg,
      }}
      accessibilityLabel={`Verification tier: ${formatTierLabel(tier)}`}
    >
      {isKushiVetted ? (
        <Award size={iconSize} color={accentHex} />
      ) : (
        <CheckBadge size={iconSize} color={accentHex} />
      )}
      <ThemedText
        style={{
          fontSize,
          color: labelHex,
          fontFamily: Fonts.semibold,
          letterSpacing: 0.2,
        }}
      >
        {formatTierLabel(tier)}
      </ThemedText>
    </View>
  );

  if (tooltipDescription) {
    return (
      <Tooltip description={tooltipDescription} className="self-start">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default TierBadge;
