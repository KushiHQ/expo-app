import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type ToastEntry = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: { label: string; onPress: () => void };
  duration: number;
};

type ToastStore = {
  toasts: ToastEntry[];
  push: (toast: Omit<ToastEntry, 'id'>) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }].slice(-5),
    }));
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
