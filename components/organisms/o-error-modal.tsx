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

const ErrorModal: React.FC<Props> = ({
  open,
  onClose,
  title = 'Something went wrong',
  description,
  action,
}) => {
  const colors = useThemeColors();

  return (
    <ThemedModal visible={open} onClose={onClose}>
      <View className="items-center">
        <View style={{ width: 250, height: 250 }}>
          <Image
            style={{ width: 250, height: 250, objectFit: 'cover' }}
            source={require('@/assets/images/error.png')}
          />
        </View>
        <View className="items-center gap-4 pb-4">
          <ThemedText type="title" style={{ color: colors.error, fontSize: 22 }}>
            {title}
          </ThemedText>
          {description && (
            <ThemedText className="text-center" style={{ color: hexToRgba(colors.text, 0.6) }}>
              {description}
            </ThemedText>
          )}
          {action && <View className="mt-4">{action}</View>}
        </View>
      </View>
    </ThemedModal>
  );
};

export default ErrorModal;
