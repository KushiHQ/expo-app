import {
	appVersionHeaders,
	compareVersions,
	decideUpdate,
	findUpgradeRequired,
	isOlder,
	isPolicyStale,
	parseVersion,
	POLICY_TTL_MS,
	toAppPlatform,
	type AppVersionPolicy
} from '../lib/k/app-version';

const policy = (p: Partial<AppVersionPolicy> = {}): AppVersionPolicy => ({
	platform: 'IOS',
	minimumVersion: '1.3.0',
	latestVersion: '1.4.0',
	storeUrl: 'https://apps.apple.com/app/id6768449564',
	message: null,
	updatedAt: '2026-10-15T00:00:00Z',
	...p
});

describe('parseVersion', () => {
	it('pads missing parts', () => {
		expect(parseVersion('1')).toEqual([1, 0, 0]);
		expect(parseVersion('1.2')).toEqual([1, 2, 0]);
		expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
	});
	it('tolerates a v prefix, whitespace, pre-release and build suffixes', () => {
		expect(parseVersion(' v1.10.3 ')).toEqual([1, 10, 3]);
		expect(parseVersion('1.2.3-beta.1')).toEqual([1, 2, 3]);
		expect(parseVersion('1.2.3+45')).toEqual([1, 2, 3]);
	});
	it('rejects malformed input', () => {
		for (const bad of ['', 'abc', '1..2', '1.2.3.4', '1.x', '-1.0.0', '1.2.', null, undefined, 42 as unknown as string]) {
			expect(parseVersion(bad)).toBeNull();
		}
	});
});

describe('compareVersions', () => {
	it('treats 1.2 and 1.2.0 as equal', () => {
		expect(compareVersions('1.2', '1.2.0')).toBe(0);
	});
	it('compares numerically, not lexically', () => {
		expect(compareVersions('1.10.0', '1.9.9')).toBe(1);
		expect(compareVersions('1.9.9', '1.10.0')).toBe(-1);
		expect(compareVersions('2.0.0', '10.0.0')).toBe(-1);
		expect(compareVersions('1.3.3', '1.3.4')).toBe(-1);
	});
	it('is not comparable when either side is malformed', () => {
		expect(compareVersions('1.2.3', 'nope')).toBeNull();
		expect(compareVersions(null, '1.0.0')).toBeNull();
		expect(isOlder('garbage', '9.9.9')).toBe(false);
		expect(isOlder('1.0.0', '')).toBe(false);
	});
});

describe('decideUpdate', () => {
	it('does nothing without a policy or a known version (fail open)', () => {
		expect(decideUpdate({ current: '1.0.0', policy: null })).toEqual({ kind: 'none' });
		expect(decideUpdate({ current: null, policy: policy() })).toEqual({ kind: 'none' });
	});

	it('forces an update below the minimum', () => {
		const d = decideUpdate({ current: '1.2.9', policy: policy({ message: '  Big fixes  ' }) });
		expect(d).toEqual({ kind: 'force', current: '1.2.9', required: '1.3.0', storeUrl: 'https://apps.apple.com/app/id6768449564', message: 'Big fixes' });
	});

	it('does not force at exactly the minimum (1.3 == 1.3.0)', () => {
		expect(decideUpdate({ current: '1.3', policy: policy() }).kind).toBe('soft');
	});

	it('suggests an update between minimum and latest', () => {
		expect(decideUpdate({ current: '1.3.3', policy: policy() })).toEqual({
			kind: 'soft',
			current: '1.3.3',
			latest: '1.4.0',
			storeUrl: 'https://apps.apple.com/app/id6768449564',
			message: null
		});
	});

	it('remembers a dismissal per latestVersion only', () => {
		expect(decideUpdate({ current: '1.3.3', policy: policy(), dismissedLatest: '1.4.0' }).kind).toBe('none');
		expect(decideUpdate({ current: '1.3.3', policy: policy(), dismissedLatest: '1.4' }).kind).toBe('none');
		expect(decideUpdate({ current: '1.3.3', policy: policy({ latestVersion: '1.5.0' }), dismissedLatest: '1.4.0' }).kind).toBe('soft');
	});

	it('a dismissal never hides the hard gate', () => {
		expect(decideUpdate({ current: '1.0.0', policy: policy(), dismissedLatest: '1.4.0' }).kind).toBe('force');
	});

	it('does nothing when up to date or newer', () => {
		expect(decideUpdate({ current: '1.4.0', policy: policy() }).kind).toBe('none');
		expect(decideUpdate({ current: '1.10.0', policy: policy({ latestVersion: '1.9.9' }) }).kind).toBe('none');
	});

	it('never blocks on malformed versions', () => {
		expect(decideUpdate({ current: 'dev', policy: policy() }).kind).toBe('none');
		expect(decideUpdate({ current: '1.0.0', policy: policy({ minimumVersion: 'x', latestVersion: 'y' }) }).kind).toBe('none');
	});

	it('forces on an UPGRADE_REQUIRED error even without a policy', () => {
		expect(decideUpdate({ current: '1.3.3', policy: null, upgradeRequired: { minimumVersion: '2.0.0', storeUrl: 'market://details?id=x' } })).toEqual({
			kind: 'force',
			current: '1.3.3',
			required: '2.0.0',
			storeUrl: 'market://details?id=x',
			message: null
		});
	});

	it('falls back to the policy for missing UPGRADE_REQUIRED details', () => {
		const d = decideUpdate({ current: '1.3.3', policy: policy({ message: 'Hi' }), upgradeRequired: {} });
		expect(d).toMatchObject({ kind: 'force', required: '1.3.0', storeUrl: 'https://apps.apple.com/app/id6768449564', message: 'Hi' });
	});
});

describe('findUpgradeRequired', () => {
	it('finds the code among other errors', () => {
		expect(
			findUpgradeRequired([
				{ extensions: { code: 'UNAUTHENTICATED' } },
				{ extensions: { code: 'UPGRADE_REQUIRED', minimumVersion: '1.4.0', storeUrl: 'https://x' } }
			])
		).toEqual({ minimumVersion: '1.4.0', storeUrl: 'https://x', message: null });
	});
	it('ignores everything else', () => {
		expect(findUpgradeRequired(undefined)).toBeNull();
		expect(findUpgradeRequired([])).toBeNull();
		expect(findUpgradeRequired([null, {}, { extensions: null }, { extensions: { code: 'FORBIDDEN' } }])).toBeNull();
	});
	it('drops non-string details', () => {
		expect(findUpgradeRequired([{ extensions: { code: 'UPGRADE_REQUIRED', minimumVersion: 2 } }])).toEqual({ minimumVersion: null, storeUrl: null, message: null });
	});
});

describe('headers and platform', () => {
	it('maps platforms', () => {
		expect(toAppPlatform('ios')).toBe('IOS');
		expect(toAppPlatform('android')).toBe('ANDROID');
		expect(toAppPlatform('web')).toBeNull();
	});
	it('builds the two headers on native only', () => {
		expect(appVersionHeaders('ios', '1.3.3')).toEqual({ 'x-kushi-app-platform': 'ios', 'x-kushi-app-version': '1.3.3' });
		expect(appVersionHeaders('android', '1.3.3')).toEqual({ 'x-kushi-app-platform': 'android', 'x-kushi-app-version': '1.3.3' });
		expect(appVersionHeaders('web', '1.3.3')).toEqual({});
		expect(appVersionHeaders('ios', null)).toEqual({});
	});
});

describe('isPolicyStale', () => {
	it('throttles to once per TTL', () => {
		expect(isPolicyStale(null, 1000)).toBe(true);
		expect(isPolicyStale(1000, 1000 + POLICY_TTL_MS - 1)).toBe(false);
		expect(isPolicyStale(1000, 1000 + POLICY_TTL_MS)).toBe(true);
	});
});
