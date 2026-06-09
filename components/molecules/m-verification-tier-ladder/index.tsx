import ThemedText from '@/components/atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HostingVerificationTier } from '@/lib/services/graphql/generated';
import { formatTierLabel, TIER_PROGRESSION, TIER_TAGLINES } from '@/lib/utils/verification/tier';
import { hexToRgba } from '@/lib/utils/colors';
import { Award, Check, Crown, MapPin, ShieldCheck, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

const TIER_ICONS: Record<HostingVerificationTier, LucideIcon> = {
  [HostingVerificationTier.Unverified]: ShieldCheck,
  [HostingVerificationTier.IdentityVerified]: User,
  [HostingVerificationTier.AddressVerified]: MapPin,
  [HostingVerificationTier.TitleChecked]: Award,
  [HostingVerificationTier.KushiVetted]: Crown,
};

type Props = {
  /** The hosting's current tier. The ladder highlights this row. */
  currentTier: HostingVerificationTier;
  /** When true, the row is rendered in a "celebration" style with gold accents. */
  isTopTier?: boolean;
};

const TierLadder: React.FC<Props> = ({ currentTier, isTopTier }) => {
  const colors = useThemeColors();
  const currentRank = TIER_PROGRESSION.indexOf(currentTier);

  return (
    <View className="gap-2">
      {TIER_PROGRESSION.map((tier, index) => {
        const Icon = TIER_ICONS[tier];
        const isCurrent = index === currentRank;
        const isReached = index < currentRank;
        const isLast = index === TIER_PROGRESSION.length - 1;
        const labelColor = isCurrent
          ? colors.primary
          : isReached
            ? colors.text
            : hexToRgba(colors.text, 0.5);
        const taglineColor = isCurrent
          ? hexToRgba(colors.text, 0.7)
          : hexToRgba(colors.text, 0.45);
        const iconBg = isCurrent
          ? isLast && isTopTier
            ? '#F59E0B'
            : colors.primary
          : isReached
            ? hexToRgba(colors.success, 0.15)
            : hexToRgba(colors.text, 0.06);
        const iconColor = isCurrent
          ? isLast && isTopTier
            ? '#FFFFFF'
            : colors['primary-content']
          : isReached
            ? colors.success
            : hexToRgba(colors.text, 0.4);
        const connectorColor = isReached
          ? colors.success
          : hexToRgba(colors.text, 0.1);

        return (
          <React.Fragment key={tier}>
            <View className="flex-row items-center gap-3">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: iconBg }}
              >
                {isReached ? (
                  <Check size={18} color={iconColor} />
                ) : (
                  <Icon size={18} color={iconColor} />
                )}
              </View>
              <View className="flex-1">
                <ThemedText
                  style={{
                    fontSize: 13,
                    color: labelColor,
                    fontFamily: isCurrent ? Fonts.bold : Fonts.medium,
                  }}
                >
                  {formatTierLabel(tier)}
                </ThemedText>
                <ThemedText
                  numberOfLines={2}
                  style={{
                    fontSize: 11,
                    color: taglineColor,
                    marginTop: 1,
                    lineHeight: 15,
                  }}
                >
                  {TIER_TAGLINES[tier]}
                </ThemedText>
              </View>
              {isCurrent ? (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: hexToRgba(colors.primary, 0.12) }}
                >
                  <ThemedText
                    style={{
                      fontSize: 10,
                      color: colors.primary,
                      fontFamily: Fonts.semibold,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    You
                  </ThemedText>
                </View>
              ) : null}
            </View>
            {!isLast ? (
              <View
                style={{
                  width: 2,
                  height: 14,
                  marginLeft: 17,
                  backgroundColor: connectorColor,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default TierLadder;
