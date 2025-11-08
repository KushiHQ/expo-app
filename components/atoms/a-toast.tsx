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
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          borderLeftColor: colors.success,
          backgroundColor: colors.background,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: Fonts.medium,
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
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          borderLeftColor: colors.error,
          backgroundColor: colors.background,
        }}
        text1Style={{
          fontSize: 17,
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
          borderRadius: 10,
          marginTop: 20,
          width: "90%",
          borderColor: hexToRgba(colors.text, 0.2),
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ThemedText style={{ fontSize: 16 }}>{text1}</ThemedText>
        {text2 && (
          <ThemedText style={{ fontSize: 14, marginTop: 4 }}>
            {text2}
          </ThemedText>
        )}
      </ThemedView>
    );
  },
};

export default toastConfig;
