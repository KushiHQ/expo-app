import React from "react";
import BottomSheet from "../atoms/a-bottom-sheet";
import ThemedText from "../atoms/a-themed-text";
import { View } from "react-native";
import Button from "../atoms/a-button";
import OTPInput from "../atoms/a-otp-input";

type Props = {
  open: boolean;
  onSuccess?: () => void;
  onError?: () => void;
  onCancel: () => void;
};

const PinVerification: React.FC<Props> = ({
  open,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [pin, setPin] = React.useState("");

  return (
    <BottomSheet isVisible={open} onClose={onCancel}>
      <View className="items-center gap-8 py-4">
        <View className="gap-4 items-center">
          <ThemedText type="title" style={{ fontSize: 18 }}>
            Enter Payment PIN
          </ThemedText>
          <OTPInput length={4} secureTextEntry onChangeText={setPin} />
          <ThemedText>Forgot Payment PIN?</ThemedText>
        </View>
        <Button
          disabled={pin.length !== 4}
          onPress={onSuccess}
          type="primary"
          className="min-w-full"
        >
          <ThemedText content="primary">Continue</ThemedText>
        </Button>
      </View>
    </BottomSheet>
  );
};

export default PinVerification;
