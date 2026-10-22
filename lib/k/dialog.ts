import { create } from 'zustand';

/**
 * Kushi's own alert dialog, used instead of React Native's `Alert.alert` so
 * prompts look like Kushi on both platforms (Android's stock dialog didn't).
 * Same call shape as `Alert.alert`, so swapping a call is one line:
 *
 *   alert('Leave without saving?', 'Your changes weren’t saved.', [
 *     { text: 'Stay', style: 'cancel' },
 *     { text: 'Leave', style: 'destructive', onPress: leave },
 *   ]);
 *
 * Rendered by <DialogHost /> (components/k/dialog.tsx) in the root layout.
 */
export type DialogButton = {
	text: string;
	style?: 'default' | 'cancel' | 'destructive';
	onPress?: () => void;
};

export type Dialog = {
	id: number;
	title: string;
	message?: string;
	buttons: DialogButton[];
	/** Tapping outside / Android back acts as the cancel button (if any). */
	cancelable: boolean;
};

type State = {
	queue: Dialog[];
	close: (id: number, button?: DialogButton) => void;
};

let nextId = 1;

export const useDialogStore = create<State>((set) => ({
	queue: [],
	close: (id, button) => {
		set((s) => ({ queue: s.queue.filter((d) => d.id !== id) }));
		// Run the handler after the dialog starts closing, so a handler that opens
		// another dialog or navigates isn't fighting the one still on screen.
		if (button?.onPress) setTimeout(button.onPress, 0);
	}
}));

export function alert(title: string, message?: string, buttons?: DialogButton[], options?: { cancelable?: boolean }) {
	const list = buttons?.length ? buttons : [{ text: 'OK' }];
	const dialog: Dialog = {
		id: nextId++,
		title,
		message,
		buttons: list,
		// A lone "OK" or a dialog with a cancel button can be dismissed by tapping
		// outside; a forced choice can't.
		cancelable: options?.cancelable ?? (list.length === 1 || list.some((b) => b.style === 'cancel'))
	};
	useDialogStore.setState((s) => ({ queue: [...s.queue, dialog] }));
}
