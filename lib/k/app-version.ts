/**
 * App version policy — pure logic (no React Native imports, so it unit-tests
 * in plain Node). The store/hook that talks to the API lives in
 * `lib/k/app-version-store.ts`; the UI in `components/k/app-update.tsx`.
 *
 * Contract with the Housing API:
 *  - Every request carries `x-kushi-app-platform: ios|android` and
 *    `x-kushi-app-version: <MAJOR.MINOR.PATCH>`.
 *  - `appVersionPolicy(platform)` (public) returns the minimum / latest
 *    versions, the store URL and an optional message.
 *  - Below the minimum, every other GraphQL request fails with
 *    `extensions.code === "UPGRADE_REQUIRED"` (+ minimumVersion, storeUrl).
 *
 * Everything here fails open: an unknown / malformed version is "not
 * comparable", and "not comparable" never blocks anyone.
 */

export type AppPlatform = 'IOS' | 'ANDROID';

export type AppVersionPolicy = {
	platform: AppPlatform;
	minimumVersion: string;
	latestVersion: string;
	storeUrl: string;
	message?: string | null;
	updatedAt?: string | null;
};

/** Set when an API response says UPGRADE_REQUIRED (server is the authority). */
export type UpgradeRequired = {
	minimumVersion?: string | null;
	storeUrl?: string | null;
	message?: string | null;
};

export type UpdateDecision =
	| { kind: 'none' }
	| { kind: 'force'; current: string | null; required: string | null; storeUrl: string | null; message: string | null }
	| { kind: 'soft'; current: string; latest: string; storeUrl: string | null; message: string | null };

export const UPGRADE_REQUIRED = 'UPGRADE_REQUIRED';
export const HEADER_PLATFORM = 'x-kushi-app-platform';
export const HEADER_VERSION = 'x-kushi-app-version';
/** Re-check the policy at most this often (launch + every foreground). */
export const POLICY_TTL_MS = 5 * 60 * 1000;

/**
 * "1.2" → [1, 2, 0]; "v1.10.3" → [1, 10, 3]; "1.2.3-beta.1" / "1.2.3+45" → [1, 2, 3].
 * Anything else (empty, letters, more than three parts, negatives) → null.
 */
export function parseVersion(v: string | null | undefined): [number, number, number] | null {
	if (typeof v !== 'string') return null;
	const core = v.trim().replace(/^v/i, '').split(/[-+]/)[0];
	if (!/^\d+(\.\d+){0,2}$/.test(core)) return null;
	const parts = core.split('.').map((n) => Number.parseInt(n, 10));
	while (parts.length < 3) parts.push(0);
	if (parts.some((n) => !Number.isSafeInteger(n))) return null;
	return [parts[0], parts[1], parts[2]];
}

/** -1 / 0 / 1, or null when either side is malformed (→ never block). */
export function compareVersions(a: string | null | undefined, b: string | null | undefined): -1 | 0 | 1 | null {
	const x = parseVersion(a);
	const y = parseVersion(b);
	if (!x || !y) return null;
	for (let i = 0; i < 3; i++) {
		if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
	}
	return 0;
}

/** True only when both versions are valid and `a` is strictly older than `b`. */
export function isOlder(a: string | null | undefined, b: string | null | undefined): boolean {
	return compareVersions(a, b) === -1;
}

/** `ios` / `android` → contract enum; anything else (web) → null. */
export function toAppPlatform(os: string): AppPlatform | null {
	if (os === 'ios') return 'IOS';
	if (os === 'android') return 'ANDROID';
	return null;
}

/** The two headers every API request carries (empty on web / unknown version). */
export function appVersionHeaders(os: string, version: string | null): Record<string, string> {
	if (!toAppPlatform(os) || !version) return {};
	return { [HEADER_PLATFORM]: os, [HEADER_VERSION]: version };
}

type GqlErrorLike = { extensions?: Record<string, unknown> | null } | null | undefined;

/** Pulls the UPGRADE_REQUIRED details out of a list of GraphQL errors, if any. */
export function findUpgradeRequired(errors: readonly GqlErrorLike[] | null | undefined): UpgradeRequired | null {
	if (!Array.isArray(errors)) return null;
	for (const e of errors) {
		const ext = e?.extensions;
		if (ext && ext.code === UPGRADE_REQUIRED) {
			const str = (k: string) => (typeof ext[k] === 'string' ? (ext[k] as string) : null);
			return { minimumVersion: str('minimumVersion'), storeUrl: str('storeUrl'), message: str('message') };
		}
	}
	return null;
}

/**
 * What to show. Order:
 *  1. The server already refused us (UPGRADE_REQUIRED) → hard gate.
 *  2. current < minimumVersion → hard gate.
 *  3. current < latestVersion and that latest wasn't dismissed → soft prompt.
 *  4. Otherwise (incl. any malformed version / no policy) → nothing.
 */
export function decideUpdate(input: {
	current: string | null;
	policy: AppVersionPolicy | null;
	upgradeRequired?: UpgradeRequired | null;
	dismissedLatest?: string | null;
}): UpdateDecision {
	const { current, policy, upgradeRequired, dismissedLatest } = input;
	const message = policy?.message?.trim() || null;

	if (upgradeRequired) {
		return {
			kind: 'force',
			current,
			required: upgradeRequired.minimumVersion || policy?.minimumVersion || null,
			storeUrl: upgradeRequired.storeUrl || policy?.storeUrl || null,
			message: upgradeRequired.message?.trim() || message
		};
	}

	if (!policy || !current) return { kind: 'none' };

	if (isOlder(current, policy.minimumVersion)) {
		return { kind: 'force', current, required: policy.minimumVersion, storeUrl: policy.storeUrl || null, message };
	}

	if (isOlder(current, policy.latestVersion) && compareVersions(dismissedLatest, policy.latestVersion) !== 0) {
		return { kind: 'soft', current, latest: policy.latestVersion, storeUrl: policy.storeUrl || null, message };
	}

	return { kind: 'none' };
}

/** Whether a policy fetched `lastFetchedAt` is due a refresh at `now`. */
export function isPolicyStale(lastFetchedAt: number | null, now: number, ttl = POLICY_TTL_MS): boolean {
	return lastFetchedAt == null || now - lastFetchedAt >= ttl;
}
