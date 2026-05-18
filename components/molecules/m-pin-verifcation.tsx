import React from 'react';
import BottomSheet from '../atoms/a-bottom-sheet';
import ThemedText from '../atoms/a-themed-text';
import { View } from 'react-native';
import Button from '../atoms/a-button';
import OTPInput from '../atoms/a-otp-input';

type Props = {
  open: boolean;
  onContinue?: (pin: string) => void;
  onCancel: () => void;
};

const PinVerification: React.FC<Props> = ({ open, onContinue, onCancel }) => {
  const [pin, setPin] = React.useState('');

  return (
    <BottomSheet isVisible={open} onClose={onCancel}>
      <View className="items-center gap-8 py-4">
        <View className="mb-8 items-center gap-4">
          <ThemedText type="title" style={{ fontSize: 18 }}>
            Enter Payment PIN
          </ThemedText>
          <OTPInput length={4} secureTextEntry onChangeText={setPin} />
        </View>
        <Button
          disabled={pin.length !== 4}
          onPress={() => onContinue?.(pin)}
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
