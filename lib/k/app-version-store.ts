/**
 * App version policy store: knows the installed version, fetches
 * `appVersionPolicy` on launch and on every return to the foreground
 * (throttled to once per POLICY_TTL_MS), and records UPGRADE_REQUIRED
 * signals from API responses. Network/parse failures never block — the
 * previous policy (or none) is kept.
 */
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
	appVersionHeaders,
	decideUpdate,
	isPolicyStale,
	toAppPlatform,
	type AppVersionPolicy,
	type UpdateDecision,
	type UpgradeRequired
} from './app-version';

/**
 * The installed binary's version. `expoConfig.version` is embedded at build
 * time from app.config.js (`version`), i.e. the store version of this binary.
 */
export const APP_VERSION: string | null = Constants.expoConfig?.version ?? null;

/** Headers for every API request (`x-kushi-app-platform` / `x-kushi-app-version`). */
export const APP_VERSION_HEADERS: Record<string, string> = appVersionHeaders(Platform.OS, APP_VERSION);

const DISMISSED_KEY = 'kushi.update.dismissedLatest';
const FETCH_TIMEOUT_MS = 10_000;

const POLICY_QUERY = `query AppVersionPolicy($platform: AppPlatform!) {
  appVersionPolicy(platform: $platform) { platform minimumVersion latestVersion storeUrl message updatedAt }
}`;

type State = {
	policy: AppVersionPolicy | null;
	upgradeRequired: UpgradeRequired | null;
	dismissedLatest: string | null;
	lastFetchedAt: number | null;
	checking: boolean;
	/** Fetch the policy if stale (or always, with `force`). Never throws. */
	refresh: (opts?: { force?: boolean }) => Promise<void>;
	/** Called by the API layer when a response carries UPGRADE_REQUIRED. */
	reportUpgradeRequired: (info: UpgradeRequired) => void;
	/** "Later" on the soft prompt — remembered per latestVersion. */
	dismiss: (latest: string) => void;
};

async function fetchPolicy(): Promise<AppVersionPolicy | null> {
	const platform = toAppPlatform(Platform.OS);
	const url = process.env.EXPO_PUBLIC_GRAPHQL_URL;
	if (!platform || !url) return null;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...APP_VERSION_HEADERS },
			body: JSON.stringify({ query: POLICY_QUERY, variables: { platform } }),
			signal: controller.signal
		});
		if (!res.ok) return null;
		const json = await res.json();
		const p = json?.data?.appVersionPolicy;
		if (!p || typeof p.minimumVersion !== 'string' || typeof p.latestVersion !== 'string') return null;
		return p as AppVersionPolicy;
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

export const useAppVersionStore = create<State>()((set, get) => ({
	policy: null,
	upgradeRequired: null,
	dismissedLatest: null,
	lastFetchedAt: null,
	checking: false,

	refresh: async ({ force = false } = {}) => {
		const { checking, lastFetchedAt } = get();
		if (checking || (!force && !isPolicyStale(lastFetchedAt, Date.now()))) return;
		set({ checking: true });
		const policy = await fetchPolicy();
		if (policy) {
			// A fresh policy that says we're fine clears an earlier UPGRADE_REQUIRED
			// (e.g. the minimum was lowered). If we're still too old, the policy
			// itself keeps the gate up, and the next API call would re-raise it.
			const stillBlocked = decideUpdate({ current: APP_VERSION, policy }).kind === 'force';
			set({ policy, lastFetchedAt: Date.now(), upgradeRequired: stillBlocked ? get().upgradeRequired : null });
		} else {
			// Failed: keep what we had, retry on the next foreground after the TTL.
			set({ lastFetchedAt: Date.now() });
		}
		set({ checking: false });
	},

	reportUpgradeRequired: (info) => {
		if (get().upgradeRequired) return;
		set({ upgradeRequired: info });
	},

	dismiss: (latest) => {
		set({ dismissedLatest: latest });
		AsyncStorage.setItem(DISMISSED_KEY, latest).catch(() => {});
	}
}));

/** Plain function for non-React code (the urql exchange, formMutation). */
export const reportUpgradeRequired = (info: UpgradeRequired) => useAppVersionStore.getState().reportUpgradeRequired(info);

/**
 * Mount once (root layout): loads the dismissed version, checks on launch and
 * whenever the app comes back to the foreground. Returns the current decision.
 */
export function useAppUpdate(): UpdateDecision {
	const policy = useAppVersionStore((s) => s.policy);
	const upgradeRequired = useAppVersionStore((s) => s.upgradeRequired);
	const dismissedLatest = useAppVersionStore((s) => s.dismissedLatest);

	useEffect(() => {
		if (!toAppPlatform(Platform.OS)) return;
		AsyncStorage.getItem(DISMISSED_KEY)
			.then((v) => v && useAppVersionStore.setState({ dismissedLatest: v }))
			.catch(() => {});
		useAppVersionStore.getState().refresh();
		const sub = AppState.addEventListener('change', (next) => {
			if (next === 'active') useAppVersionStore.getState().refresh();
		});
		return () => sub.remove();
	}, []);

	return decideUpdate({ current: APP_VERSION, policy, upgradeRequired, dismissedLatest });
}
