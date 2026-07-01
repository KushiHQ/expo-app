import ThemedText from '@/components/atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { HostingVerificationTier } from '@/lib/services/graphql/generated';
import { VERIFICATION_TIER_OPTIONS } from '@/lib/constants/hosting/verification';
import { formatTierLabel, TIER_TAGLINES } from '@/lib/utils/verification/tier';
import { Award, Check, Crown, MapPin, ShieldCheck, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';

const TIER_ICONS: Record<HostingVerificationTier, LucideIcon> = {
  [HostingVerificationTier.Unverified]: ShieldCheck,
  [HostingVerificationTier.IdentityVerified]: User,
  [HostingVerificationTier.AddressVerified]: MapPin,
  [HostingVerificationTier.TitleChecked]: Award,
  [HostingVerificationTier.KushiVetted]: Crown,
};

type Props = {
  selected: HostingVerificationTier | undefined;
  onSelect: (tier: HostingVerificationTier) => void;
  /** When set, that tier is rendered as "current" and disabled. */
  currentTier?: HostingVerificationTier;
};

const TierPicker: React.FC<Props> = ({ selected, onSelect, currentTier }) => {
  const colors = useThemeColors();

  return (
    <View className="gap-3">
      {VERIFICATION_TIER_OPTIONS.map((opt) => {
        const Icon = TIER_ICONS[opt.value];
        const isSelected = selected === opt.value;
        const isCurrent = currentTier === opt.value;
        const isKushiTop = opt.value === HostingVerificationTier.KushiVetted;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (isCurrent) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(opt.value);
            }}
            disabled={isCurrent}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isCurrent }}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: isSelected
                ? hexToRgba(colors.primary, 0.14)
                : isCurrent
                  ? hexToRgba(colors.success, 0.08)
                  : hexToRgba(colors.text, 0.05),
              opacity: isCurrent ? 0.65 : 1,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: isSelected
                    ? isKushiTop
                      ? '#F59E0B'
                      : colors.primary
                    : isCurrent
                      ? colors.success
                      : hexToRgba(colors.text, 0.08),
                }}
              >
                <Icon
                  size={20}
                  color={isSelected || isCurrent ? '#FFFFFF' : hexToRgba(colors.text, 0.5)}
                />
              </View>
              <View className="flex-1">
                <ThemedText
                  style={{
                    fontSize: 15,
                    color: colors.text,
                    fontFamily: Fonts.bold,
                  }}
                >
                  {opt.label}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: hexToRgba(colors.text, 0.6),
                    marginTop: 2,
                    lineHeight: 15,
                  }}
                >
                  {TIER_TAGLINES[opt.value]}
                </ThemedText>
              </View>
              {isCurrent ? (
                <View
                  className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: hexToRgba(colors.success, 0.15) }}
                >
                  <Check size={10} color={colors.success} />
                  <ThemedText
                    style={{
                      fontSize: 10,
                      color: colors.success,
                      fontFamily: Fonts.semibold,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Current
                  </ThemedText>
                </View>
              ) : isSelected ? (
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Check size={14} color={colors['primary-content']} />
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TierPicker;
