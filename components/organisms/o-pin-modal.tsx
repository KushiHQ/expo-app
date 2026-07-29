import React from 'react';
import BottomSheet from '../atoms/a-bottom-sheet';
import { Image } from 'expo-image';
import { View } from 'react-native';
import OTPInput from '../atoms/a-otp-input';
import ThemedText from '../atoms/a-themed-text';
import Button from '../atoms/a-button';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { TriangleAlert } from 'lucide-react-native';

type Props = {
  open: boolean;
  label?: string;
  description?: string;
  /** Optional attention callout shown above the action — e.g. an irreversible
   *  step the user should double-check before confirming. */
  warning?: string;
  length: number;
  onClose: () => void;
  onSubmit?: (pin: string) => void;
};

const PINModal: React.FC<Props> = ({
  open,
  label,
  description,
  warning,
  onClose,
  length,
  onSubmit,
}) => {
  const colors = useThemeColors();
  const [pin, setPin] = React.useState('');

  return (
    <BottomSheet isVisible={open} onClose={onClose}>
      <View className="items-center gap-4">
        <View className="items-center">
          {label && (
            <ThemedText className="mt-4" type="subtitle">
              {label}
            </ThemedText>
          )}
          {description && (
            <ThemedText style={{ color: hexToRgba(colors.text, 0.7) }}>{description}</ThemedText>
          )}
        </View>
        <Image
          style={{
            width: 160,
            height: 160,
            objectFit: 'cover',
          }}
          source={require('@/assets/images/security-shield.png')}
        />
        <View className="items-center gap-2">
          <OTPInput onChangeText={setPin} length={length} />
        </View>
        {warning && (
          <View
            className="flex-row items-start gap-2.5 rounded-2xl p-3.5"
            style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
          >
            <TriangleAlert size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <ThemedText
              style={{ flex: 1, fontSize: 12.5, lineHeight: 18, color: hexToRgba(colors.text, 0.8) }}
            >
              {warning}
            </ThemedText>
          </View>
        )}
        <View className="my-8 flex-row gap-4">
          <Button onPress={onClose} className="flex-1" variant="outline" type="primary">
            <ThemedText content="tinted">Cancel</ThemedText>
          </Button>
          <Button className="flex-1" type="primary" onPress={() => onSubmit?.(pin)}>
            <ThemedText content="primary">Submit</ThemedText>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

export default PINModal;
