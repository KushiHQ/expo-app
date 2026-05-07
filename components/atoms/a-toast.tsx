/* eslint-disable react-hooks/rules-of-hooks */
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import ThemedView from "./a-themed-view";
import ThemedText from "./a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";

const toastConfig: ToastConfig = {
  success: (props) => {
    const colors = useThemeColors();
    return (
      <BaseToast
        {...props}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          borderLeftColor: colors.success,
          backgroundColor: colors.background,
          // subtle shadow for premium feel
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: Fonts.bold,
          color: colors.text,
        }}
        text2Style={{
          color: colors.text,
        }}
      />
    );
  },
  info: (props) => {
    const colors = useThemeColors();
    return (
      <BaseToast
        {...props}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          borderLeftColor: colors.info,
          backgroundColor: colors.background,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: Fonts.bold,
          color: colors.text,
        }}
        text2Style={{
          color: colors.text,
        }}
      />
    );
  },
  error: (props) => {
    const colors = useThemeColors();
    return (
      <ErrorToast
        {...props}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          borderLeftColor: colors.error,
          backgroundColor: colors.background,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        text1Style={{
          fontSize: 17,
          fontFamily: Fonts.bold,
          color: colors.text,
        }}
        text2Style={{
          fontSize: 15,
          color: colors.text,
        }}
      />
    );
  },
  customToast: ({ text1, text2, props }) => {
    const colors = useThemeColors();
    return (
      <ThemedView
        {...props}
        style={{
          minHeight: 60,
          borderRadius: 12,
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          backgroundColor: colors.surface,
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
          // shadow for luxurious feel
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <ThemedText style={{ fontSize: 16, fontFamily: Fonts.bold }}>{text1}</ThemedText>
        {text2 && (
          <ThemedText style={{ fontSize: 14, marginTop: 4, fontFamily: Fonts.medium }}>{text2}</ThemedText>
        )}
      </ThemedView>
    );
  },
};

export default toastConfig;
