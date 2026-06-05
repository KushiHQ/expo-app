import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  DEFAULT_SECURITY_SETTINGS,
  useSecuritySettingsStore,
} from '@/lib/stores/security-settings';
import {
  useActiveFormHosingStore,
  useHostingFilterStore,
  useHostingRoomsStore,
} from '@/lib/stores/hostings';
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
    // Wipe any in-progress hosting draft so the next user/session doesn't see it
    useActiveFormHosingStore.getState().clear();
    useHostingRoomsStore.getState().setRooms([]);
    useHostingFilterStore.getState().resetFilter();
    clearAuthTokens();
    GoogleSignin.signOut();

    logout({}).then((res) => {
      if (res.data) {
        toast.show({
          type: 'info',
          text1: 'Success',
          text2: res.data.logout.message,
        });
      }
    });
    router.dismissAll();
    router.replace('/onboarding');
  }, [setSecuritySettings, reset, logout]);

  return null;
}
