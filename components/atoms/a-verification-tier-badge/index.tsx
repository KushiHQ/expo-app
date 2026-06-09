import React from "react";
import { View } from "react-native";
import { Award, ShieldCheck as CheckBadge } from "lucide-react-native";
import ThemedText from "./../a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { HostingVerificationTier } from "@/lib/services/graphql/generated";
import { formatTierLabel } from "@/lib/utils/verification/tier";
import Tooltip from "../a-tooltip";

type Props = {
  tier: HostingVerificationTier;
  size?: "sm" | "md";
  tooltipDescription?: string;
};

const TierBadge: React.FC<Props> = ({
  tier,
  size = "md",
  tooltipDescription,
}) => {
  const colors = useThemeColors();

  const isKushiVetted = tier === HostingVerificationTier.KushiVetted;
  const isUnverified = tier === HostingVerificationTier.Unverified;

  const accentHex = isKushiVetted
    ? "#F59E0B"
    : isUnverified
      ? hexToRgba(colors.text, 0.5)
      : colors.secondary;
  const containerBg = isKushiVetted
    ? "rgba(245, 158, 11, 0.12)"
    : isUnverified
      ? hexToRgba(colors.text, 0.06)
      : hexToRgba(colors.secondary, 0.12);
  const borderHex = isKushiVetted
    ? "rgba(245, 158, 11, 0.35)"
    : isUnverified
      ? hexToRgba(colors.text, 0.15)
      : hexToRgba(colors.secondary, 0.35);

  const paddingH = size === "sm" ? 8 : 10;
  const paddingV = size === "sm" ? 3 : 5;
  const iconSize = size === "sm" ? 10 : 12;
  const fontSize = size === "sm" ? 10 : 11;

  const badge = (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full"
      style={{
        paddingHorizontal: paddingH,
        paddingVertical: paddingV,
        backgroundColor: containerBg,
        borderWidth: 1,
        borderColor: borderHex,
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
          color: accentHex,
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
      <Tooltip
        description={tooltipDescription}
        position="right"
        className="self-start"
      >
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default TierBadge;
