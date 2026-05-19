import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  DEFAULT_SECURITY_SETTINGS,
  useSecuritySettingsStore,
} from '@/lib/stores/security-settings';
import { useUserStore } from '@/lib/stores/users';
import { clearAuthTokens } from '@/lib/utils/auth';
import { router } from 'expo-router';
import React from 'react';
import { useLogoutMutation } from '@/lib/services/graphql/generated';
import { toast } from '@/lib/hooks/use-toast';

export default function Logout() {
  const reset = useUserStore((v) => v.reset);
  const setSecuritySettings = useSecuritySettingsStore((state) => state.setSecuritySettings);
  const [, logout] = useLogoutMutation();

  React.useEffect(() => {
    setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
    reset();
    clearAuthTokens();
    GoogleSignin.signOut();

    logout({}).then((res) => {
      if (res.data) {
        toast.show({
          type: 'info',
          text1: 'Success',
          text2: res.data.logout.message,
        });
      } else {
        toast.show({ type: 'error', text2: 'Server logout failed' });
      }
    });
    router.replace('/onboarding');
  }, [setSecuritySettings, reset, logout]);

  return null;
}
