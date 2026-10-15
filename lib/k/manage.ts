/**
 * Host-side helpers: tenancy dates, how much Kushi has verified about an
 * applicant, and where an accepted tenancy is (payment → escrow → payout).
 */

/** Tenancy end date from its start, length and payment interval. */
export function tenancyEnd(start: string | null | undefined, periods: number, interval: string | null | undefined): Date | null {
	if (!start) return null;
	const d = new Date(start);
	if (Number.isNaN(d.getTime())) return null;
	const n = Math.max(1, periods || 1);
	switch (String(interval ?? '').toUpperCase()) {
		case 'NIGHTLY':
			d.setDate(d.getDate() + n);
			break;
		case 'WEEKLY':
			d.setDate(d.getDate() + 7 * n);
			break;
		case 'MONTHLY':
			d.setMonth(d.getMonth() + n);
			break;
		case 'ONE_TIME_PAYMENT':
			return null;
		default:
			d.setFullYear(d.getFullYear() + n);
	}
	return d;
}

export type TrustCheck = { key: string; label: string; ok: boolean; detail: string };

export type Trust = {
	nin?: boolean | null;
	bvn?: boolean | null;
	phone?: boolean | null;
	signed?: boolean | null;
	guarantor?: boolean | null;
};

/** The checks a host sees, in the order they matter. */
export function trustChecks(t: Trust): TrustCheck[] {
	return [
		{ key: 'nin', label: 'Identity (NIN)', ok: !!t.nin, detail: t.nin ? 'Name and photo matched the national ID database.' : 'Not verified yet.' },
		{ key: 'bvn', label: 'Bank identity (BVN)', ok: !!t.bvn, detail: t.bvn ? 'Matched their bank record.' : 'Not provided.' },
		{ key: 'phone', label: 'Phone number', ok: !!t.phone, detail: t.phone ? 'Confirmed with a code.' : 'Not confirmed.' },
		{ key: 'signed', label: 'Signed agreement', ok: !!t.signed, detail: t.signed ? 'They signed your tenancy agreement.' : 'No signature on file.' },
		{ key: 'guarantor', label: 'Guarantor', ok: !!t.guarantor, detail: t.guarantor ? 'Someone vouches for them.' : 'None given.' }
	];
}

/** One-word summary of how much is verified. */
export function trustLevel(checks: TrustCheck[]): { label: string; tone: 'success' | 'info' | 'warn'; score: number } {
	const ok = (k: string) => checks.find((c) => c.key === k)?.ok;
	const score = checks.filter((c) => c.ok).length;
	if (ok('nin') && score >= 4) return { label: 'Strong', tone: 'success', score };
	if (ok('nin') && score >= 2) return { label: 'Good', tone: 'info', score };
	return { label: 'Basic', tone: 'warn', score };
}

export type TenancyBooking = {
	id: string;
	status?: string | null;
	paymentStatus?: string | null;
	amount?: string | number | null;
	hostServiceCharge?: string | number | null;
	cautionFee?: string | number | null;
	commencementDate?: string | null;
	expiryDate?: string | null;
	expiresAt?: string | null;
	autoFinalizeAt?: string | null;
	createdAt?: string | null;
	hostTransaction?: { id: string; status: string; amount?: string | number | null; disbursementAmount?: string | number | null; createdAt?: string | null } | null;
};

export type TenancyStep = 'accepted' | 'paid' | 'released';

/** Where an accepted tenancy is, for the host. */
export function tenancyStage(b: TenancyBooking | null | undefined): { step: TenancyStep; label: string; tone: 'live' | 'info' | 'success' | 'danger' | 'neutral'; ended?: boolean } {
	if (!b) return { step: 'accepted', label: 'Waiting for payment', tone: 'live' };
	if (b.status === 'CANCELED') return { step: 'accepted', label: 'Cancelled', tone: 'neutral', ended: true };
	if (b.paymentStatus === 'FAILED') return { step: 'accepted', label: 'Payment failed', tone: 'danger' };
	if (b.paymentStatus !== 'PAID') return { step: 'accepted', label: 'Waiting for payment', tone: 'live' };
	if (b.status === 'COMPLETED') return { step: 'released', label: 'Paid out', tone: 'success' };
	return { step: 'paid', label: 'Paid into escrow', tone: 'info' };
}

export const PAYOUT: Record<string, { label: string; tone: 'live' | 'info' | 'success' | 'danger' | 'neutral' }> = {
	PENDING: { label: 'Queued', tone: 'live' },
	PROCESSING: { label: 'On its way', tone: 'info' },
	SUCCESS: { label: 'Paid to your bank', tone: 'success' },
	FAILED: { label: 'Failed — Kushi will retry', tone: 'danger' },
	NEEDS_RECONCILIATION: { label: 'Held — support is on it', tone: 'danger' },
	CANCELLED: { label: 'Cancelled', tone: 'neutral' },
	REFUNDED: { label: 'Refunded', tone: 'neutral' }
};

/** Reasons a host can give when declining (sent as a message, never stored on the application). */
export const DECLINE_REASONS = [
	'The home is no longer available',
	'The move-in date doesn’t work for me',
	'I’d like a longer tenancy',
	'I’ve accepted someone else',
	'I need more verification'
];
