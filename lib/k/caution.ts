/**
 * Caution deposit: shared shapes, wording and sums for the guest's trip page
 * and the host's booking.
 *
 * How it works on the server (see server_v2 housing/db_queries/caution_payouts.rs):
 * - A host claims part of the deposit. The guest has 7 days to accept or
 *   dispute; after that Kushi reviews it.
 * - Accepted (or approved by Kushi) claims are paid to the host straight away.
 * - After the tenancy, the guest asks for the rest; Kushi approves and it is
 *   sent to the account they gave. If their bank rejects it, they send new
 *   details.
 */
import { gql } from 'urql';
export type Tone = 'live' | 'info' | 'success' | 'danger' | 'neutral' | 'warn';

export type Claim = {
	id: string;
	bookingId: string;
	amountRequested: string | number;
	/** PENDING_GUEST_RESPONSE | GUEST_APPROVED | GUEST_DISPUTED | ADMIN_APPROVED | ADMIN_DECLINED | RELEASED */
	status: string;
	hostNotes?: string | null;
	guestResponseNotes?: string | null;
	adminNotes?: string | null;
	createdAt: string;
	resolvedAt?: string | null;
	lastUpdated: string;
	/** Host payout, once approved. */
	transactionId?: string | null;
	/** Sent to Kushi after 7 days without a guest answer. */
	escalatedAt?: string | null;
};

export type Refund = {
	id: string;
	bookingId: string;
	amount: string | number;
	/** REQUESTED | BLOCKED | PROCESSING | COMPLETED | FAILED */
	status: string;
	accountNumber: string;
	accountName: string;
	bankName: string;
	bankCode: string;
	blockedReason?: string | null;
	createdAt: string;
	lastUpdated: string;
	approvedAt?: string | null;
};

/** Days the guest has to answer a claim before Kushi reviews it. */
export const ANSWER_DAYS = 7;

const CLAIM_FIELDS = `id bookingId amountRequested status hostNotes guestResponseNotes adminNotes createdAt resolvedAt lastUpdated transactionId escalatedAt`;
const REFUND_FIELDS = `id bookingId amount status accountNumber accountName bankName bankCode blockedReason createdAt lastUpdated approvedAt`;

export const CAUTION_FOR_BOOKING = gql`
	query CautionForBooking($bookingId: String!) {
		cautionClaimsForBooking(bookingId: $bookingId) { ${CLAIM_FIELDS} }
		cautionRefundForBooking(bookingId: $bookingId) { ${REFUND_FIELDS} }
	}
`;

export const RESPOND_TO_CLAIM = gql`
	mutation CautionRespond($input: RespondToCautionClaimInput!) {
		respondToCautionClaim(input: $input) { message data { ${CLAIM_FIELDS} } }
	}
`;

export const MAKE_CLAIM = gql`
	mutation CautionMakeClaim($input: RequestCautionReleaseInput!) {
		requestCautionRelease(input: $input) { message data { ${CLAIM_FIELDS} } }
	}
`;

export const REQUEST_REFUND = gql`
	mutation CautionRequestRefund($input: RequestCautionRefundInput!) {
		requestCautionRefund(input: $input) { message data { ${REFUND_FIELDS} } }
	}
`;

/** The booking behind an application, for the host's view. */
export const BOOKING_FOR_APPLICATION = gql`
	query CautionBookingForApplication($id: String!) {
		bookingApplication(bookingApplicationId: $id) {
			id
			booking { id status paymentStatus cautionFee cautionCustodyFee commencementDate expiryDate fullName }
		}
	}
`;

export const num = (v: string | number | null | undefined) => Number(v ?? 0) || 0;

/** The day the guest must answer by. */
export function answerBy(createdAt: string): Date {
	return new Date(new Date(createdAt).getTime() + ANSWER_DAYS * 864e5);
}

const isApproved = (s: string) => s === 'GUEST_APPROVED' || s === 'ADMIN_APPROVED' || s === 'RELEASED';
const isOpen = (s: string) => s === 'PENDING_GUEST_RESPONSE' || s === 'GUEST_DISPUTED';

/** Deposit minus Kushi's custody fee, minus approved claims; what's still open. */
export function breakdown(cautionFee: unknown, custodyFee: unknown, claims: Claim[]) {
	const held = num(cautionFee as number);
	const custody = num(custodyFee as number);
	const approved = claims.filter((c) => isApproved(c.status)).reduce((t, c) => t + num(c.amountRequested), 0);
	const open = claims.filter((c) => isOpen(c.status)).reduce((t, c) => t + num(c.amountRequested), 0);
	return { held, custody, approved, open, refundable: Math.max(0, held - custody - approved) };
}

/** A claim's state in the guest's words. */
export function claimForGuest(c: Claim): { label: string; tone: Tone; detail?: string } {
	switch (c.status) {
		case 'PENDING_GUEST_RESPONSE':
			return { label: 'Needs your answer', tone: 'warn' };
		case 'GUEST_APPROVED':
			return { label: c.transactionId ? 'You accepted · paying your host' : 'You accepted', tone: 'info' };
		case 'GUEST_DISPUTED':
			return c.escalatedAt
				? { label: 'Kushi is reviewing', tone: 'warn', detail: `You didn’t answer within ${ANSWER_DAYS} days, so Kushi is deciding. We may contact you.` }
				: { label: 'You disputed · Kushi is reviewing', tone: 'warn' };
		case 'ADMIN_APPROVED':
			return { label: 'Kushi approved it · paying your host', tone: 'info' };
		case 'ADMIN_DECLINED':
			return { label: 'Kushi declined it', tone: 'success', detail: 'Your deposit is unaffected.' };
		case 'RELEASED':
			return { label: 'Paid to your host', tone: 'neutral' };
		default:
			return { label: c.status, tone: 'neutral' };
	}
}

/** A claim's state in the host's words. */
export function claimForHost(c: Claim): { label: string; tone: Tone; detail?: string } {
	switch (c.status) {
		case 'PENDING_GUEST_RESPONSE':
			return { label: 'Waiting for the guest', tone: 'warn', detail: `They have until ${answerBy(c.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} to answer; then Kushi reviews it.` };
		case 'GUEST_APPROVED':
			return { label: 'Guest accepted · paying you', tone: 'info' };
		case 'GUEST_DISPUTED':
			return c.escalatedAt
				? { label: 'Kushi is reviewing', tone: 'warn', detail: `The guest didn’t answer within ${ANSWER_DAYS} days.` }
				: { label: 'Guest disputed · Kushi is reviewing', tone: 'warn' };
		case 'ADMIN_APPROVED':
			return { label: 'Kushi approved · paying you', tone: 'info' };
		case 'ADMIN_DECLINED':
			return { label: 'Kushi declined it', tone: 'danger' };
		case 'RELEASED':
			return { label: 'Paid to you', tone: 'success' };
		default:
			return { label: c.status, tone: 'neutral' };
	}
}

/** The refund's state in the guest's words. */
export function refundForGuest(r: Refund): { label: string; tone: Tone } {
	switch (r.status) {
		case 'REQUESTED':
			return { label: 'Waiting for Kushi to approve', tone: 'warn' };
		case 'BLOCKED':
			return { label: 'On hold', tone: 'neutral' };
		case 'PROCESSING':
			return { label: 'On its way to your bank', tone: 'info' };
		case 'COMPLETED':
			return { label: 'Refunded', tone: 'success' };
		case 'FAILED':
			return { label: 'Your bank rejected this account', tone: 'danger' };
		default:
			return { label: r.status, tone: 'neutral' };
	}
}
