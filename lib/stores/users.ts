import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../types/users";

const DEFAULT_USER: UserData = { hostListingsView: "list" };

type UserStore = {
  user: UserData;
  updateUser: (user: Partial<UserData>) => void;
  reset: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: DEFAULT_USER,
      updateUser: (user) =>
        set((state) => ({ user: { ...state.user, ...user } })),
      reset: () => set({ user: DEFAULT_USER }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
