import React from "react";
import * as LocalAuthentication from "expo-local-authentication";
import BottomSheet from "../atoms/a-bottom-sheet";
import ThemedText from "../atoms/a-themed-text";
import { Platform, Pressable, View } from "react-native";
import { MynauiFaceId, PhFingerprintSimpleBold } from "../icons/i-biometrics";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "../atoms/a-button";

type Props = {
  open: boolean;
  onSuccess?: () => void;
  onError?: () => void;
  onCancel: () => void;
  onUsePin?: () => void;
};

const BiometricsVerification: React.FC<Props> = ({
  open,
  onSuccess,
  onError,
  onUsePin,
  onCancel,
}) => {
  const colors = useThemeColors();

  const handleAuthenticate = () => {
    LocalAuthentication.authenticateAsync({
      biometricsSecurityLevel: "strong",
      promptMessage: "Verify Fingerprint",
    }).then((val) => {
      if (val.success) {
        onSuccess?.();
      } else {
        onError?.();
      }
    });
  };

  return (
    <BottomSheet isVisible={open} onClose={onCancel}>
      <View className="items-center gap-8 py-4">
        <ThemedText type="title" style={{ fontSize: 22 }}>
          Use {Platform.OS === "ios" ? "Face Id" : "Fingerprint"}
        </ThemedText>
        <Pressable onPress={handleAuthenticate}>
          {Platform.OS === "ios" ? (
            <MynauiFaceId color={colors.primary} size={160} />
          ) : (
            <PhFingerprintSimpleBold color={colors.primary} size={160} />
          )}
        </Pressable>
        <Button onPress={onUsePin} type="tinted" style={{ paddingBlock: 4 }}>
          <ThemedText content="tinted">Use Pin Instead</ThemedText>
        </Button>
      </View>
    </BottomSheet>
  );
};

export default BiometricsVerification;
