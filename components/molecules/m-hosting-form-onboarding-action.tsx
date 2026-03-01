import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { CustomSvgProps } from "@/lib/types/svgType";
import { hexToRgba } from "@/lib/utils/colors";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";

export type HostingActionItem = {
  icon: LucideIcon | React.FC<CustomSvgProps>;
  title: string;
  description: string;
};

type Props = {
  icon: LucideIcon | React.FC<CustomSvgProps>;
  onPress?: () => void;
  disabled?: boolean;
  color?: "primary" | "accent" | "default";
  children?: React.ReactNode;
};

const HostingFormOnboardingAction: React.FC<Props> = ({
  onPress,
  disabled,
  color = "default",
  icon,
  children,
}) => {
  const colors = useThemeColors();

  const Icon = icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(
        "flex-row items-center gap-4 rounded-3xl border p-[14px]",
        disabled && "opacity-50",
      )}
      style={{
        borderColor:
          color === "primary"
            ? hexToRgba(colors.primary, 0.2)
            : color === "accent"
              ? hexToRgba(colors.accent, 0.2)
              : hexToRgba(colors.text, 0.15),
        backgroundColor:
          color === "primary"
            ? hexToRgba(colors.primary, 0.15)
            : color === "accent"
              ? hexToRgba(colors.accent, 0.15)
              : undefined,
      }}
    >
      <View
        className="w-12 h-12 items-center justify-center rounded-full border"
        style={{
          backgroundColor: hexToRgba(colors.primary, 0.1),
          borderColor:
            color === "primary"
              ? hexToRgba(colors.primary, 0.2)
              : color === "accent"
                ? hexToRgba(colors.accent, 0.2)
                : hexToRgba(colors.text, 0.1),
        }}
      >
        <Icon size={20} color={colors.text} />
      </View>
      {children}
    </Pressable>
  );
};

export default HostingFormOnboardingAction;
