import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Centered: React.FC<Props> = ({ children, className }) => {
  const colors = useThemeColors();

  return (
    <View className={twMerge("flex flex-row gap-6 items-center", className)}>
      <View
        style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
        className="h-px flex-1"
      ></View>
      {children}
      <View
        style={{ backgroundColor: hexToRgba(colors["text"], 0.2) }}
        className="h-px flex-1"
      ></View>
    </View>
  );
};

export default Centered;
