import { useToastStore, ToastType } from '@/lib/stores/toast-store';

type ShowOptions = {
  type: ToastType;
  text1?: string;
  text2: string;
  action?: { label: string; onPress: () => void };
  duration?: number;
};

function buildEntry(opts: ShowOptions) {
  return {
    type: opts.type,
    title: opts.text1,
    message: opts.text2,
    action: opts.action,
    duration: opts.duration ?? (opts.action ? 6000 : 4000),
  };
}

export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);
  return {
    show: (opts: ShowOptions) => push(buildEntry(opts)),
    dismiss,
  };
}

// Imperative API for non-component contexts (utils, service functions)
export const toast = {
  show: (opts: ShowOptions) => useToastStore.getState().push(buildEntry(opts)),
};
