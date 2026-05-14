import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  DEFAULT_SECURITY_SETTINGS,
  useSecuritySettingsStore,
} from "@/lib/stores/security-settings";
import { useUserStore } from "@/lib/stores/users";
import { clearAuthTokens } from "@/lib/utils/auth";
import { router } from "expo-router";
import React from "react";
import { useLogoutMutation } from "@/lib/services/graphql/generated";
import Toast from "react-native-toast-message";
//
export default function Logout() {
  const reset = useUserStore((v) => v.reset);
  const setSecuritySettings = useSecuritySettingsStore(
    (state) => state.setSecuritySettings,
  );
  const [, logout] = useLogoutMutation();

  React.useEffect(() => {
    setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
    reset();
    clearAuthTokens();
    GoogleSignin.signOut();

    logout({}).then((res) => {
      if (res.data) {
        Toast.show({
          type: "info",
          text1: "Success",
          text2: res.data.logout.message,
        });
      } else {
        Toast.show({ type: "error", text2: "Server logout failed" });
      }
    });
    router.replace("/onboarding");
  }, [setSecuritySettings, reset, logout]);

  return null;
}
