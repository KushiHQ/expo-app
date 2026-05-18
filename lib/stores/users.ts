import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, UserType } from '../types/users';

const DEFAULT_USER: UserData = {
  hostListingsView: 'list',
  userType: UserType.Guest,
};

type UserStore = {
  user: UserData;
  returnUrl: string | null;
  updateUser: (user: Partial<UserData>) => void;
  setReturnUrl: (url: string | null) => void;
  reset: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: DEFAULT_USER,
      returnUrl: null,
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
      setReturnUrl: (url) => set({ returnUrl: url }),
      reset: () => set({ user: DEFAULT_USER, returnUrl: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
