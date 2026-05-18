import React from 'react';
import ThemedModal from '../molecules/m-modal';
import { View } from 'react-native';
import { Image } from 'expo-image';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  title?: string;
  description?: string;
  open: boolean;
  action?: React.ReactNode;
  onClose: () => void;
};

const SuccessModal: React.FC<Props> = ({ open, onClose, title, description, action }) => {
  const colors = useThemeColors();

  return (
    <ThemedModal visible={open} onClose={onClose}>
      <View className="items-center">
        <View
          style={{
            width: 250,
            height: 250,
          }}
        >
          <Image
            style={{
              width: 250,
              height: 250,
              objectFit: 'cover',
            }}
            source={require('@/assets/images/success-check.png')}
          />
        </View>
        <View className="items-center gap-4 pb-4">
          <ThemedText type="title" style={{ color: colors.primary, fontSize: 22 }}>
            {title}
          </ThemedText>
          <ThemedText className="text-center" style={{ color: hexToRgba(colors.text, 0.6) }}>
            {description}
          </ThemedText>
          <View className="mt-4">{action}</View>
        </View>
      </View>
    </ThemedModal>
  );
};

export default SuccessModal;
