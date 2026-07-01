import { useCountUp } from "@/lib/utils/animations";
import React from "react";
import { View } from "react-native";
import ThemedText from "./a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { SURFACE } from "@/lib/constants/surface";
import { TablerCurrencyNaira } from "../icons/i-currency";
import { LucideIcon, Info } from "lucide-react-native";
import Tooltip from "./a-tooltip";
import { twMerge } from "tailwind-merge";

type Props = {
  label: string;
  value: number;
  index: number;
  currency?: boolean;
  percentage?: boolean;
  description?: string;
  icon?: LucideIcon;
};

const AnalyticsCard: React.FC<Props> = ({
  label,
  value,
  index,
  currency,
  percentage,
  description,
  icon: Icon,
}) => {
  const colors = useThemeColors();
  const val = useCountUp({ targetNumber: value, duration: 1500 });

  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
      }}
      className={twMerge(
        "mb-2 flex-1 gap-5 p-5",
        (index + 1) % 2 !== 0 && "mr-2",
      )}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-1">
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            className="whitespace-nowrap"
            style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              lineHeight: 18,
              color: hexToRgba(colors.text, 0.5),
            }}
          >
            {label}
          </ThemedText>
          {description && (
            <Tooltip description={description}>
              <Info size={13} color={hexToRgba(colors.text, 0.3)} />
            </Tooltip>
          )}
        </View>
        {Icon && (
          <View
            style={{
              backgroundColor: hexToRgba(colors.primary, 0.12),
              padding: 9,
              borderRadius: 14,
            }}
          >
            <Icon size={18} color={colors.primary} />
          </View>
        )}
      </View>

      <View className="gap-1">
        <View className="flex-row items-center" style={{ flex: 1 }}>
          {currency && (
            <TablerCurrencyNaira
              color={colors.text}
              size={24}
              style={{ marginRight: -2, flexShrink: 0 }}
            />
          )}
          <ThemedText
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            style={{
              fontFamily: Fonts.black,
              fontSize: 27,
              lineHeight: 34,
              letterSpacing: -1,
              flex: 1,
            }}
          >
            {val.toLocaleString()}
            {percentage && "%"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default AnalyticsCard;
