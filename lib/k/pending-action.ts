/**
 * Signed-out Save / Message / Apply: open the account sheet, remember what the
 * person wanted, and finish it once they're signed in.
 *
 * The pending action lives in AsyncStorage (not memory) so it survives the
 * email-code step and an app restart. It expires after 30 minutes and runs once.
 */
import { useCallback, useEffect, useRef } from 'react';
import { setHostIntent } from '@/lib/k/session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { create } from 'zustand';
import { useUserStore } from '@/lib/stores/users';

export type AccountIntent = 'save' | 'message' | 'apply';

export type PendingAction = {
	kind: AccountIntent;
	hostingId: string;
	returnTo: string;
	/** Apply only: the stay length picked in the quote sheet. */
	periods?: number;
	at: number;
};

const KEY = 'k.pending-action.v1';
const SIGNED_IN_BEFORE = 'k.signed-in-before.v1';
const TTL = 30 * 60 * 1000;

/* ───────────────────────── Sheet store ───────────────────────── */

type AccountSheetState = {
	intent: AccountIntent | null;
	/** This phone has had a signed-in account before → "Sign in" leads. */
	returning: boolean;
	close: () => void;
};

export const useAccountSheet = create<AccountSheetState>()((set) => ({
	intent: null,
	returning: false,
	close: () => set({ intent: null })
}));

/**
 * Record the action, point `returnUrl` back at the listing and open the sheet.
 * Call only when signed out.
 */
export function askForAccount(action: Omit<PendingAction, 'at'>) {
	// Acting as a renter now: an earlier "List a property" no longer decides where sign-up lands.
	setHostIntent(false).catch(() => {});
	useUserStore.getState().setReturnUrl(action.returnTo);
	AsyncStorage.setItem(KEY, JSON.stringify({ ...action, at: Date.now() } satisfies PendingAction)).catch(() => {});
	useAccountSheet.setState({ intent: action.kind });
}

/** The person closed the sheet without choosing: forget the action and the return trip. */
export function dropPendingAction() {
	useUserStore.getState().setReturnUrl(null);
	AsyncStorage.removeItem(KEY).catch(() => {});
}

/* ───────────────────────── Signed in before ───────────────────────── */

export function markSignedInBefore() {
	if (useAccountSheet.getState().returning) return;
	useAccountSheet.setState({ returning: true });
	AsyncStorage.setItem(SIGNED_IN_BEFORE, '1').catch(() => {});
}

/**
 * Keeps `returning` up to date. Mounted once by the sheet host, so every
 * sign-in path (email, code, Google, Apple) marks the phone without touching
 * startSession.
 */
export function useSignedInBeforeFlag() {
	useEffect(() => {
		AsyncStorage.getItem(SIGNED_IN_BEFORE)
			.then((v) => {
				if (v === '1') useAccountSheet.setState({ returning: true });
			})
			.catch(() => {});
		if (useUserStore.getState().user.user?.id) markSignedInBefore();
		return useUserStore.subscribe((s) => {
			if (s.user.user?.id) markSignedInBefore();
		});
	}, []);
}

/* ───────────────────────── Run once ───────────────────────── */

let queue: Promise<unknown> = Promise.resolve();

/** Read and clear the pending action if it's for this listing and still fresh. Serialized so it can only be taken once. */
function takePendingAction(hostingId: string): Promise<PendingAction | null> {
	const next = queue.then(async () => {
		const raw = await AsyncStorage.getItem(KEY).catch(() => null);
		if (!raw) return null;
		let p: PendingAction | null = null;
		try {
			p = JSON.parse(raw) as PendingAction;
		} catch {
			p = null;
		}
		if (!p || typeof p.at !== 'number' || Date.now() - p.at > TTL) {
			await AsyncStorage.removeItem(KEY).catch(() => {});
			return null;
		}
		if (p.hostingId !== hostingId) return null;
		await AsyncStorage.removeItem(KEY).catch(() => {});
		return p;
	});
	queue = next.catch(() => null);
	return next;
}

/**
 * On a listing screen: once signed in and focused, run the action the person
 * asked for before signing in, then clear it.
 *
 * The short wait lets startSession's dismissAll/replace settle, so an old
 * listing screen that is about to be replaced never takes the action (its
 * timer is cancelled on blur/unmount before anything is read).
 */
export function usePendingAction(hostingId: string | undefined, run: (action: PendingAction) => void) {
	const signedIn = useUserStore((s) => !!s.user.user?.id);
	const runRef = useRef(run);
	useEffect(() => {
		runRef.current = run;
	});
	useFocusEffect(
		useCallback(() => {
			if (!signedIn || !hostingId) return;
			const t = setTimeout(() => {
				takePendingAction(hostingId)
					.then((a) => {
						if (a) runRef.current(a);
					})
					.catch(() => {});
			}, 400);
			return () => clearTimeout(t);
		}, [signedIn, hostingId])
	);
}
