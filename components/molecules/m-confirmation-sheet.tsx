import { View } from "react-native";
import BottomSheet from "../atoms/a-bottom-sheet";
import React from "react";
import { Image } from "expo-image";
import ThemedText from "../atoms/a-themed-text";
import Button from "../atoms/a-button";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";

type Props = {
  open: boolean;
  onClose: () => void;
  prompt?: string;
  description?: string;
  onConfirm?: () => void;
  confirmPrompt?: string;
  cancelPrompt?: string;
  confirmMode?: "error" | "default";
};

const ConfirmationSheet: React.FC<Props> = ({
  open,
  onClose,
  prompt,
  description,
  onConfirm,
  confirmPrompt,
  cancelPrompt,
  confirmMode = "default",
}) => {
  const colors = useThemeColors();

  return (
    <BottomSheet isVisible={open} onClose={onClose}>
      <View className="items-center gap-8 pb-4">
        <Image
          style={{
            width: 250,
            height: 250,
            objectFit: "cover",
          }}
          source={require("@/assets/images/caution.png")}
        />
        <View className="items-center gap-2">
          <ThemedText type="semibold">{prompt}</ThemedText>
          {description && (
            <ThemedText
              className="text-center max-w-[400px]"
              style={{ color: hexToRgba(colors.text, 0.7) }}
            >
              {description}
            </ThemedText>
          )}
        </View>
        <View className="flex-row items-center gap-4">
          <Button
            variant="outline"
            className="flex-1"
            style={{ borderColor: hexToRgba(colors.accent, 0.6) }}
            onPress={onClose}
          >
            <ThemedText style={{ color: colors.accent }}>
              {cancelPrompt ?? "Cancel"}
            </ThemedText>
          </Button>
          <Button
            type={confirmMode === "error" ? "error" : "primary"}
            className="flex-1"
            onPress={onConfirm}
          >
            <ThemedText content={confirmMode === "error" ? "error" : "primary"}>
              {confirmPrompt ?? "Confirm"}
            </ThemedText>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

export default ConfirmationSheet;
