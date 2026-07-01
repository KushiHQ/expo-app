import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { X } from 'lucide-react-native';

type ModalSize = 'small' | 'medium' | 'large' | 'full';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
};

const ThemedModal: React.FC<Props> = ({
  visible,
  onClose,
  children,
  size = 'medium',
  showCloseButton = true,
  animationType = 'slide',
  transparent = true,
}) => {
  const colors = useThemeColors();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { width: '80%', maxHeight: '40%' };
      case 'medium':
        return { width: '90%', maxHeight: '60%' };
      case 'large':
        return { width: '95%', maxHeight: '80%' };
      case 'full':
        return { width: '100%', height: '100%', borderRadius: 0 };
      default:
        return { width: '90%', maxHeight: '60%' };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View
            style={{
              backgroundColor: hexToRgba('#000000', 0.55),
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </Pressable>

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              boxShadow: SURFACE.shadowHigh,
              ...getSizeStyles(),
            },
          ]}
        >
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              style={{ backgroundColor: hexToRgba(colors.text, 0.08) }}
              className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color={colors.text} size={18} />
            </Pressable>
          )}

          <ScrollView
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  bodyContent: {
    padding: 24,
  },
});

export default ThemedModal;
