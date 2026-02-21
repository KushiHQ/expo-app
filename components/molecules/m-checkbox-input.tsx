import { Pressable, View } from "react-native";
import Checkbox from "../atoms/a-checkbox";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import React from "react";

type Props = {
  checked?: boolean;
  description?: string;
  onCheckChange?: (v: boolean) => void;
};

const CheckboxInput: React.FC<Props> = ({
  checked: defChecked,
  description,
  onCheckChange,
}) => {
  const [checked, setChecked] = React.useState(defChecked);
  const colors = useThemeColors();

  const handleCheckChange = () => {
    onCheckChange?.(!checked);
    setChecked(!checked);
  };

  return (
    <Pressable
      onPress={handleCheckChange}
      className="flex-row items-start gap-2"
    >
      <View className="pt-0.5">
        <Checkbox
          color={colors.primary}
          size={20}
          checked={checked}
          onValueChange={handleCheckChange}
        />
      </View>
      <ThemedText className="flex-1" style={{ fontSize: 14 }}>
        {description}
      </ThemedText>
    </Pressable>
  );
};

export default CheckboxInput;
