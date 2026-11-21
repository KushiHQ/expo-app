/**
 * Explore's location + price filter: the choices shared by Explore's Search and
 * Filters sheets and the first-run Location screen, the one-line summary under
 * Explore's chips, and the display-only widening used when a search finds too
 * few homes.
 */
import { useEffect, useState } from 'react';
import type { HostingFilterInput } from '@/lib/services/graphql/generated';
import { useHostingFilterStore } from '@/lib/stores/hostings';

/** Price bands (per year for rent). "Any price" clears the price filter. */
export const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
	{ label: 'Any price' },
	{ label: 'Under ₦500k', max: 500_000 },
	{ label: '₦500k – ₦1.5m', min: 500_000, max: 1_500_000 },
	{ label: '₦1.5m – ₦5m', min: 1_500_000, max: 5_000_000 },
	{ label: 'Above ₦5m', min: 5_000_000 }
];

/** Popular states, as stored on listings. Abuja (FCT) first. */
export const POPULAR_STATES = ['Federal Capital Territory', 'Lagos', 'Nasarawa', 'Rivers', 'Oyo', 'Kaduna', 'Enugu', 'Abia'];

export const FCT = 'Federal Capital Territory';

/** The name people know a state by ("Federal Capital Territory" → "Abuja (FCT)"). */
export function stateLabel(state?: string | null): string {
	if (!state) return '';
	return /federal capital territory|^fct$|^abuja$/i.test(state.trim()) ? 'Abuja (FCT)' : state;
}

export function priceBandOn(band: { min?: number; max?: number }, filter: HostingFilterInput): boolean {
	return (filter.minPrice ?? undefined) === band.min && (filter.maxPrice ?? undefined) === band.max;
}

/** True once the saved Explore filter has been read back from storage. */
export function useHostingFilterHydrated(): boolean {
	const [hydrated, setHydrated] = useState(() => useHostingFilterStore.persist.hasHydrated());
	useEffect(() => {
		const off = useHostingFilterStore.persist.onFinishHydration(() => setHydrated(true));
		setHydrated(useHostingFilterStore.persist.hasHydrated());
		return off;
	}, []);
	return hydrated;
}

// ---------------------------------------------------------------------------
// Widening. Level 0 is the person's own filter; 1 drops the area, city and
// price but keeps the state; 2 drops the state too ("all homes"). Other
// choices (rent/sale, type, verification, rating) are always kept.
// ---------------------------------------------------------------------------

export type WidenLevel = 0 | 1 | 2;

/** Fewer homes than this on the first page → widen. */
export const WIDEN_BELOW = 3;

export function widenFilter(filter: HostingFilterInput, level: WidenLevel): HostingFilterInput {
	if (level === 0) return filter;
	const { search, city, minPrice, maxPrice, state, ...rest } = filter;
	return level === 1 ? { ...rest, state } : rest;
}

const same = (a: HostingFilterInput, b: HostingFilterInput) => JSON.stringify(clean(a)) === JSON.stringify(clean(b));
const clean = (f: HostingFilterInput) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** The next level that actually changes the query, or null when there is nothing left to drop. */
export function nextWidenLevel(filter: HostingFilterInput, level: WidenLevel): WidenLevel | null {
	const now = widenFilter(filter, level);
	for (const l of [1, 2] as const) {
		// Level 1 means "all homes in the state": only when there is a state to keep.
		if (l === 1 && !filter.state) continue;
		if (l > level && !same(widenFilter(filter, l), now)) return l;
	}
	return null;
}

const homes = (n: number) => (n === 1 ? 'home' : 'homes');

/**
 * The line under Explore's chips. `counts[l]` is how many homes level `l`
 * found before Explore widened past it.
 */
export function exploreSummary(filter: HostingFilterInput, nearMe: boolean, level: WidenLevel, counts: Partial<Record<WidenLevel, number>>): string | null {
	const area = filter.search?.trim();
	const st = stateLabel(filter.state);
	const budget = !!(filter.minPrice || filter.maxPrice);
	if (!area && !st && !budget && !nearMe) return null;
	const within = budget ? ' within your budget' : '';

	// What the person asked for, e.g. "in Wuse within your budget".
	const asked = [nearMe ? 'near you' : area ? `in ${area}` : st ? `in ${st}` : '', budget ? 'within your budget' : ''].filter(Boolean).join(' ');

	if (level === 0) {
		const where = nearMe ? ' near you' : area && st ? ` in ${area}, ${st}` : area ? ` in ${area}` : st ? ` in ${st}` : '';
		return `Homes${where}${within}, newest first.`;
	}

	// Which search came back too small, and what Explore shows instead.
	const from: WidenLevel = level === 2 && counts[1] !== undefined ? 1 : 0;
	const scope = from === 1 ? `in ${st}` : asked;
	const n = counts[from] ?? 0;
	const shows = level === 1 ? `all homes in ${st}` : 'all homes';
	if (n === 0) return `No homes ${scope} yet. Showing ${shows}.`;
	return `Only ${n} ${homes(n)} ${scope}, so Explore shows ${shows}.`;
}
