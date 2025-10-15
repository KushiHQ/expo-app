import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { CarbonCircleFilled, CarbonCircleOutline } from "../icons/i-circle";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";

type Props = {
  selected?: boolean;
  onSelect?: () => void;
  icon?: React.ReactNode;
  label?: string;
};

const PaymentMethodItem: React.FC<Props> = ({
  icon,
  label,
  selected,
  onSelect,
}) => {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onSelect}
      className="flex-row py-3 px-7 rounded-xl items-center justify-between"
      style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
    >
      <View className="flex-row items-center gap-4">
        {icon}
        <ThemedText>{label}</ThemedText>
      </View>
      {selected ? (
        <CarbonCircleFilled size={24} color={colors.primary} />
      ) : (
        <CarbonCircleOutline size={24} color={colors.primary} />
      )}
    </Pressable>
  );
};

export default PaymentMethodItem;
