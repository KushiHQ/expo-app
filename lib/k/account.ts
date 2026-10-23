/**
 * Account, verification and money-history helpers for the redesigned You area.
 *
 * Operations here are hand-typed (like lib/k/caution.ts) so the shared generated
 * file stays untouched; they only read fields the server already exposes.
 */
import { gql, useQuery } from 'urql';
import type { TransactionStatus, TransactionType } from '@/lib/services/graphql/generated';
import { humanize } from './format';

/* ───────────────────────── Receipt ───────────────────────── */

export const K_RECEIPT = gql`
	query KReceipt($reference: String!) {
		transactionByReference(reference: $reference) {
			id
			amount
			type
			status
			direction
			createdAt
			lastUpdated
			reference
			disbursementAmount
			transferFee
			booking {
				id
				bookingReference
				status
				paymentStatus
				autoFinalizeAt
				commencementDate
				durationDescription
				cautionFee
				amount
				feeLineItems {
					key
					label
					amount
					description
				}
				hosting {
					id
					title
					city
					state
					coverImage {
						id
						asset {
							id
							publicUrl
						}
					}
				}
				hostTransaction {
					id
					status
					createdAt
					reference
				}
			}
		}
	}
`;

type Money = string | number;

export type Receipt = {
	id: string;
	amount: Money;
	type: TransactionType | string;
	status: TransactionStatus | string;
	direction?: 'INCOMING' | 'OUTGOING' | string | null;
	createdAt: string;
	lastUpdated: string;
	reference?: string | null;
	disbursementAmount?: Money | null;
	transferFee?: Money | null;
	booking?: {
		id: string;
		bookingReference: string;
		status?: 'PAID' | 'COMPLETED' | 'CANCELED' | string | null;
		paymentStatus: string;
		autoFinalizeAt?: string | null;
		commencementDate?: string | null;
		durationDescription?: string | null;
		cautionFee?: Money | null;
		amount: Money;
		feeLineItems: { key: string; label: string; amount: Money; description: string }[];
		hosting?: { id: string; title?: string | null; city?: string | null; state?: string | null; coverImage?: { id: string; asset: { id: string; publicUrl?: string | null } } | null } | null;
		hostTransaction?: { id: string; status: string; createdAt: string; reference?: string | null } | null;
	} | null;
};

export function useReceipt(reference: string) {
	return useQuery<{ transactionByReference: Receipt }, { reference: string }>({ query: K_RECEIPT, variables: { reference }, pause: !reference, requestPolicy: 'cache-and-network' });
}

/* ───────────────────────── Payments list ───────────────────────── */

export const K_PAYMENTS = gql`
	query KPayments($filter: TransactionFilter, $pagination: PaginationInput) {
		transactions(filter: $filter, pagination: $pagination) {
			id
			amount
			type
			status
			createdAt
			reference
			booking {
				id
				status
				autoFinalizeAt
				hosting {
					id
					title
				}
				hostTransaction {
					id
					status
				}
			}
		}
	}
`;

export type PaymentRow = Pick<Receipt, 'id' | 'amount' | 'type' | 'status' | 'createdAt' | 'reference'> & {
	booking?: { id: string; status?: string | null; autoFinalizeAt?: string | null; hosting?: { id: string; title?: string | null } | null; hostTransaction?: { id: string; status: string } | null } | null;
};
type PaymentsVars = { filter?: { userId?: string } | null; pagination?: { limit?: number; offset?: number } | null };

/** urql hook in the shape lib/hooks/use-infinite-query expects. */
export function usePaymentsQuery(options: { variables: PaymentsVars; pause?: boolean; requestPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'cache-and-network' }) {
	return useQuery<{ transactions: PaymentRow[] }, PaymentsVars>({ query: K_PAYMENTS, ...options });
}

/* ───────────────────── Where the money is ───────────────────── */

export type Tone = 'live' | 'info' | 'success' | 'danger' | 'neutral' | 'warn';
export type MoneyState = { key: 'processing' | 'failed' | 'escrow' | 'released' | 'refunded' | 'paid' | 'received' | 'payout_pending' | 'payout_failed'; label: string; tone: Tone; body: string };

const KIND: Record<string, { label: string; incoming: boolean }> = {
	booking_payment: { label: 'Rent payment', incoming: false },
	guest_cancellation_refund: { label: 'Refund', incoming: true },
	host_booking_payment: { label: 'Payout', incoming: true },
	host_cancellation_compensation: { label: 'Cancellation compensation', incoming: true },
	guest_caution_refund: { label: 'Caution refund', incoming: true },
	host_caution_claim: { label: 'Caution claim payout', incoming: true },
	listing_tier_boost: { label: 'Listing boost', incoming: false },
	verification_fee: { label: 'Verification fee', incoming: false }
};

export const txKind = (type: string) => KIND[String(type).toLowerCase()] ?? { label: humanize(String(type)) || 'Payment', incoming: false };

/**
 * Plain-English answer to "where is my money?" for one transaction. For a rent
 * payment the booking decides it: PAID = Kushi holds it in escrow, COMPLETED =
 * released to the host, CANCELED = refunded/cancelled.
 */
export function moneyState(t: Pick<Receipt, 'type' | 'status'> & { createdAt?: string | null } & { booking?: { status?: string | null; autoFinalizeAt?: string | null; hostTransaction?: { id: string } | null } | null }): MoneyState {
	const st = String(t.status).toUpperCase();
	const type = String(t.type).toLowerCase();
	// A checkout that never got the bank's confirmation stays PENDING for ever.
	const stale = !!t.createdAt && Date.now() - new Date(t.createdAt).getTime() > 2 * 36e5;
	if (st === 'PENDING' && stale && !txKind(type).incoming)
		return { key: 'failed', label: 'Not completed', tone: 'neutral', body: 'This payment was started but the bank never confirmed it, so no money moved to the host. If your account was debited, contact support with the reference below.' };
	if (st === 'PENDING' || st === 'PROCESSING' || st === 'NEEDS_RECONCILIATION') {
		if (txKind(type).incoming)
			return { key: 'payout_pending', label: 'On its way', tone: 'info', body: 'Kushi has started sending this money to you. Banks usually settle it within one working day.' };
		return { key: 'processing', label: 'Processing', tone: 'info', body: 'We’re confirming this payment with the bank. It usually takes a few minutes.' };
	}
	if (st === 'FAILED' || st === 'CANCELLED') {
		if (txKind(type).incoming)
			return { key: 'payout_failed', label: 'Payout failed', tone: 'danger', body: 'The bank didn’t accept this transfer. Check the account details you gave us, then contact support so we can resend it.' };
		return { key: 'failed', label: st === 'FAILED' ? 'Didn’t go through' : 'Cancelled', tone: 'danger', body: 'No money moved to the host. If your account was debited anyway, your bank normally reverses it within 24 hours — contact support with the reference if it doesn’t.' };
	}
	if (st === 'REFUNDED') return { key: 'refunded', label: 'Refunded', tone: 'neutral', body: 'This money has been sent back to you.' };
	if (type === 'booking_payment') {
		const b = t.booking;
		if (b?.status === 'CANCELED') return { key: 'refunded', label: 'Cancelled', tone: 'neutral', body: 'This booking was cancelled. Any refund you’re owed shows as a separate “Refund” in your payments.' };
		if (b?.status === 'COMPLETED' || b?.hostTransaction)
			return { key: 'released', label: 'Released to host', tone: 'success', body: 'You confirmed your move-in (or the hold period ended), so Kushi released the rent to the host.' };
		return {
			key: 'escrow',
			label: 'Held in escrow',
			tone: 'live',
			body: `Kushi is holding this money safely. The host gets it only after you confirm your move-in${b?.autoFinalizeAt ? ` or on ${shortDate(b.autoFinalizeAt)}, whichever comes first` : ''}. If something is wrong, open the booking and raise it before then.`
		};
	}
	if (type === 'guest_cancellation_refund') return { key: 'refunded', label: 'Refunded', tone: 'success', body: 'Refunded to the account you paid from. Banks can take up to 5 working days to show it.' };
	if (txKind(type).incoming) return { key: 'received', label: 'Paid to you', tone: 'success', body: 'Sent to your payout account.' };
	return { key: 'paid', label: 'Paid', tone: 'success', body: 'Payment received by Kushi.' };
}

/* ───────────────────────── Dates (Lagos) ───────────────────────── */

function lagos(opts: Intl.DateTimeFormatOptions) {
	try {
		return new Intl.DateTimeFormat('en-NG', { ...opts, timeZone: 'Africa/Lagos' });
	} catch {
		return new Intl.DateTimeFormat('en-NG', opts);
	}
}
const SHORT = lagos({ day: 'numeric', month: 'short', year: 'numeric' });
const FULL = lagos({ day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const MONTH = lagos({ month: 'long', year: 'numeric' });

const valid = (v?: string | Date | null) => {
	if (!v) return null;
	const d = typeof v === 'string' ? new Date(v) : v;
	return Number.isNaN(d.getTime()) ? null : d;
};
/** 12 Oct 2026 (Lagos time). */
export const shortDate = (v?: string | Date | null) => {
	const d = valid(v);
	return d ? SHORT.format(d) : '—';
};
/** 12 Oct 2026, 3:04 pm (Lagos time). */
export const fullDate = (v?: string | Date | null) => {
	const d = valid(v);
	return d ? `${FULL.format(d)} WAT` : '—';
};
/** October 2026 — month headings in money history. */
export const monthOf = (v?: string | Date | null) => {
	const d = valid(v);
	return d ? MONTH.format(d) : 'Earlier';
};

export const cleanError = (m?: string | null) => (m ?? '').replace('[GraphQL] ', '').trim();

/* ───────────────────────── Links ───────────────────────── */

export const LINKS = {
	privacy: 'https://kushi.ng/privacy',
	terms: 'https://kushi.ng/terms',
	cancellation: 'https://housing.kushi.ng/legal/booking-cancellation-policy',
	supportEmail: 'support@kushi.ng'
} as const;

/** Apple "Hide My Email" relay addresses (mail only arrives from senders registered with Apple). */
export const isPrivateRelay = (email?: string | null) => !!email && /@privaterelay\.appleid\.com$/i.test(email);
