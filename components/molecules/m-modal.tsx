import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  ViewStyle,
} from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { X } from "lucide-react-native";

type ModalSize = "small" | "medium" | "large" | "full";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  animationType?: "slide" | "fade" | "none";
  transparent?: boolean;
};

const ThemedModal: React.FC<Props> = ({
  visible,
  onClose,
  children,
  size = "medium",
  showCloseButton = true,
  animationType = "slide",
  transparent = true,
}) => {
  const colors = useThemeColors();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "small":
        return { width: "80%", maxHeight: "40%" };
      case "medium":
        return { width: "90%", maxHeight: "60%" };
      case "large":
        return { width: "95%", maxHeight: "80%" };
      case "full":
        return { width: "100%", height: "100%", borderRadius: 0 };
      default:
        return { width: "90%", maxHeight: "60%" };
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View
            style={{
              backgroundColor: hexToRgba(colors.text, 0.3),
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </Pressable>

        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              ...getSizeStyles(),
              ...Platform.select({
                ios: {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 8,
                },
              }),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <View>
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={{ backgroundColor: hexToRgba(colors.text, 0.15) }}
                  className="absolute top-4 w-6 h-6 items-center justify-center rounded-full right-4"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ThemedText style={{ fontSize: 24 }}>
                    <X color={colors.text} size={18} />
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  body: {
    maxHeight: "100%",
  },
  bodyContent: {
    padding: 20,
  },
});

export default ThemedModal;
