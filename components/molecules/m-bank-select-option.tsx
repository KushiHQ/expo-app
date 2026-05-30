import { Bank } from "@/lib/types/queries/banks";
import { View } from "react-native";
import { SelectionDetails } from "./m-select-input";
import React from "react";
import { Image } from "expo-image";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import Checkbox from "../atoms/a-checkbox";
import { hexToRgba } from "@/lib/utils/colors";

type Props = Bank & SelectionDetails;

const BankSelectOption: React.FC<Props> = ({ selected, ...bank }) => {
  const colors = useThemeColors();
  const image = bank.logo
    ? `https://raw.githubusercontent.com/supermx1/nigerian-banks-api/main/${bank.logo}`
    : "https://png.pngtree.com/png-clipart/20190619/original/pngtree-concept-banking-logo-png-image_4017929.jpg";

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <View
          className="h-[36px] w-[36px] border"
          style={{
            borderRadius: 999,
            borderColor: colors.primary,
          }}
        >
          <Image
            source={{
              uri: image,
            }}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 999,
            }}
            contentFit="cover"
            transition={300}
            placeholder={{
              uri: "https://png.pngtree.com/png-clipart/20190619/original/pngtree-concept-banking-logo-png-image_4017929.jpg",
            }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
        <ThemedText>{bank.name}</ThemedText>
      </View>
      <Checkbox
        color={selected ? colors.primary : hexToRgba(colors.text, 0.6)}
        checked={selected}
      />
    </View>
  );
};

export default BankSelectOption;
