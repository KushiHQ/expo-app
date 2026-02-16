import React, { useEffect, useRef } from "react";
import { Modal, View, StyleSheet, Animated, Easing } from "react-native";
import Logo from "../../assets/vectors/logo.svg";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";

type Props = {
  visible: boolean;
};

const LoadingModal: React.FC<Props> = ({ visible }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colors = useThemeColors();

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [visible, scaleAnim]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => { }}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: hexToRgba(colors.text, 0.2) },
        ]}
      >
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <Logo width={100} height={100} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingModal;
