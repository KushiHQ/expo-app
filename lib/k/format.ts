/**
 * Formatting helpers for Kushi Housing. One source of truth for money, dates and
 * payment-interval wording (the old app mislabelled every duration as "Years").
 */

// Hand-rolled: Hermes' Intl has no compact notation and its currency symbol varies by
// device locale ("NGN 1,000" vs "₦1,000"), so money is formatted without Intl.
const group = (n: number) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** ₦1,250,000 */
export function naira(amount: number | null | undefined): string {
	if (amount == null || Number.isNaN(Number(amount))) return '—';
	const n = Number(amount);
	return `${n < 0 ? '-' : ''}₦${group(n)}`;
}

/** ₦1.3M — for tight spaces (map pins, cards). */
export function nairaCompact(amount: number | null | undefined): string {
	if (amount == null || Number.isNaN(Number(amount))) return '—';
	const n = Number(amount);
	const abs = Math.abs(n);
	const [div, suffix] = abs >= 1e12 ? [1e12, 'T'] : abs >= 1e9 ? [1e9, 'B'] : abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'K'] : [1, ''];
	const v = (abs / div).toFixed(div === 1 ? 0 : 1).replace(/\.0$/, '');
	return `${n < 0 ? '-' : ''}₦${v}${suffix}`;
}

export type Interval = 'NIGHTLY' | 'WEEKLY' | 'MONTHLY' | 'ANUALLY' | 'ONE_TIME_PAYMENT' | string;

const INTERVALS: Record<string, { unit: string; units: string; per: string; adverb: string }> = {
	NIGHTLY: { unit: 'night', units: 'nights', per: '/ night', adverb: 'Nightly' },
	WEEKLY: { unit: 'week', units: 'weeks', per: '/ week', adverb: 'Weekly' },
	MONTHLY: { unit: 'month', units: 'months', per: '/ month', adverb: 'Monthly' },
	ANUALLY: { unit: 'year', units: 'years', per: '/ year', adverb: 'Yearly' },
	ANNUALLY: { unit: 'year', units: 'years', per: '/ year', adverb: 'Yearly' },
	ONE_TIME_PAYMENT: { unit: 'payment', units: 'payments', per: '', adverb: 'One-off' }
};

function interval(i: Interval | null | undefined) {
	return INTERVALS[String(i ?? '').toUpperCase()] ?? INTERVALS.ANUALLY;
}

/** "/ month" */
export const perInterval = (i: Interval | null | undefined) => interval(i).per;
/** "3 months", "1 night" */
export const duration = (n: number, i: Interval | null | undefined) =>
	`${n} ${n === 1 ? interval(i).unit : interval(i).units}`;
/** "months" */
export const intervalUnits = (i: Interval | null | undefined) => interval(i).units;
/** "Monthly" */
export const intervalAdverb = (i: Interval | null | undefined) => interval(i).adverb;

/** Short-let = nightly or weekly stays (matches the backend's fee rules). */
export const isShortLet = (i: Interval | null | undefined) =>
	['NIGHTLY', 'WEEKLY'].includes(String(i ?? '').toUpperCase());

const DATE = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('en-NG', {
	day: 'numeric',
	month: 'short',
	hour: 'numeric',
	minute: '2-digit'
});

export function date(value: string | Date | null | undefined): string {
	if (!value) return '—';
	const d = typeof value === 'string' ? new Date(value) : value;
	return Number.isNaN(d.getTime()) ? '—' : DATE.format(d);
}

export function dateTime(value: string | Date | null | undefined): string {
	if (!value) return '—';
	const d = typeof value === 'string' ? new Date(value) : value;
	return Number.isNaN(d.getTime()) ? '—' : DATE_TIME.format(d);
}

/** "in 3 days", "2 hours ago". No Intl.RelativeTimeFormat — Hermes doesn't have it. */
export function relative(value: string | Date | null | undefined): string {
	if (!value) return '';
	const d = typeof value === 'string' ? new Date(value) : value;
	if (Number.isNaN(d.getTime())) return '';
	const diff = d.getTime() - Date.now();
	const abs = Math.abs(diff);
	const units: [string, number][] = [
		['year', 31536e6],
		['month', 2592e6],
		['week', 6048e5],
		['day', 864e5],
		['hour', 36e5],
		['minute', 6e4]
	];
	for (const [unit, ms] of units) {
		if (abs < ms) continue;
		const n = Math.round(abs / ms);
		if (unit === 'day' && n === 1) return diff < 0 ? 'yesterday' : 'tomorrow';
		const label = `${n} ${unit}${n === 1 ? '' : 's'}`;
		return diff < 0 ? `${label} ago` : `in ${label}`;
	}
	return 'just now';
}

/** Days remaining until a date (0 if past). */
export function daysUntil(value: string | Date | null | undefined): number {
	if (!value) return 0;
	const d = typeof value === 'string' ? new Date(value) : value;
	return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 864e5));
}

/** Today as YYYY-MM-DD in local time (for <input type=date min>). */
export function todayISO(): string {
	const d = new Date();
	return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
}

/** "Lekki, Lagos" from loose location fields. */
export function place(...parts: (string | null | undefined)[]): string {
	return parts
		.map((p) => p?.trim())
		.filter(Boolean)
		.filter((p, i, a) => a.indexOf(p) === i)
		.join(', ');
}

/** "Self Contained" from "SELF_CONTAINED". */
export function humanize(value: string | null | undefined): string {
	if (!value) return '';
	return value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name: string | null | undefined): string {
	return (name ?? '?')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join('');
}
