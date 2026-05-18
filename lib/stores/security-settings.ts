import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ATOM_KEYS from '../constants/atom-keys';

export const DEFAULT_SECURITY_SETTINGS = {
  biometrics: false,
  payWithBiometrics: false,
  kyc: false,
};

type SecuritySettings = typeof DEFAULT_SECURITY_SETTINGS;

interface SecuritySettingsState {
  settings: SecuritySettings;
  setSecuritySettings: (newSettings: Partial<SecuritySettings>) => void;
  resetSecuritySettings: () => void;
}

export const useSecuritySettingsStore = create<SecuritySettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SECURITY_SETTINGS,

      setSecuritySettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSecuritySettings: () => set({ settings: DEFAULT_SECURITY_SETTINGS }),
    }),
    {
      name: ATOM_KEYS.SECURITY_SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
