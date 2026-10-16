/**
 * The guest's booking journey in one place: the trip query (application +
 * booking + who owns the listing), money maths and the rules the server
 * enforces, so screens never guess.
 *
 * Server facts (KushiHQ/server_v2, housing/db_queries/bookings.rs and
 * booking_application.rs):
 * - booking.amount is everything the guest pays, Kushi's platform fee
 *   included. feeLineItems add up to it exactly.
 * - Paying starts a 14-day finalisation grace period (autoFinalizeAt). The
 *   money sits in escrow until the guest confirms the handover or the grace
 *   period ends; then the host is paid and the signed tenancy agreement PDF
 *   is generated and emailed.
 * - The guest can cancel a paid booking any time before it is finalised.
 *   Refund: 90% of rent, service charge, legal fee and stamp duty in full,
 *   and the caution deposit minus Kushi's custody fee. The platform fee is
 *   not refunded. Kushi refunds to the original card in 5–7 business days.
 * - Withdrawing an application is blocked once Kushi or the host verified
 *   it (HOST_VERIFIED, ADMIN_VERIFIED) or it was accepted.
 * - Students, corps members and people between jobs without a guarantor are
 *   declined automatically by the risk check.
 */
import { gql } from 'urql';
import { PropertyType } from '@/lib/types/enums/hostings';

export const GRACE_DAYS = 14;
export const CANCEL_FEE_RATE = 0.1;
export const REFUND_DAYS = '5–7 business days';

export const num = (v: unknown) => Number(v ?? 0) || 0;

const BOOKING_FIELDS = `
	id
	bookingReference
	status
	paymentStatus
	paymentMethod
	amount
	guestServiceCharge
	cautionFee
	cautionCustodyFee
	serviceCharge
	legalFee
	stampDuty
	createdAt
	lastUpdated
	commencementDate
	expiryDate
	autoFinalizeAt
	fullName
	email
	phoneNumber
	feeLineItems { key label description amount }
	transaction { id status reference amount createdAt lastUpdated }
	tenancyAgreementAsset { id publicUrl }
	guest { id user { id } }
	hosting { id street landmarks city state propertyType }
	userReview { id description cleanliness accuracy communication location checkIn value }
`;

/** One trip: the application, its booking (if accepted) and the listing's owner. */
export const TRIP = gql`
	query KTrip($id: String!) {
		bookingApplication(bookingApplicationId: $id) {
			id
			status
			statusDetails
			fullName
			email
			phoneNumber
			correspondenceAddress
			commencementDate
			intervalMultiplier
			createdAt
			lastUpdated
			guestFormData { employmentStatus incomeRanges occupancyTypes guarantorRelationships guarantorName guarantorPhone guarantorAddress }
			guest { id user { id } }
			hosting {
				id
				title
				city
				state
				price
				paymentInterval
				propertyType
				host { id user { id profile { fullName } } }
				coverImage { id asset { id publicUrl } }
			}
			booking { ${BOOKING_FIELDS} }
		}
	}
`;

/** Booking id → its application and who's on each side (for redirects from old links). */
export const BOOKING_ROUTE = gql`
	query KBookingRoute($id: String!) {
		booking(bookingId: $id) {
			id
			guest { id user { id } }
			bookingApplication { id }
		}
	}
`;

/** Application id → who's on each side (for redirects from old links). */
export const APPLICATION_ROUTE = gql`
	query KApplicationRoute($id: String!) {
		bookingApplication(bookingApplicationId: $id) {
			id
			guest { id user { id } }
			hosting { id host { id user { id } } }
		}
	}
`;

export type FeeLine = { key: string; label: string; description?: string | null; amount: unknown };

export type TripBooking = {
	id: string;
	bookingReference: string;
	status?: 'PAID' | 'CANCELED' | 'COMPLETED' | null;
	paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
	paymentMethod?: string | null;
	amount: unknown;
	guestServiceCharge: unknown;
	cautionFee?: unknown;
	cautionCustodyFee?: unknown;
	serviceCharge?: unknown;
	legalFee?: unknown;
	stampDuty?: unknown;
	createdAt: string;
	lastUpdated: string;
	commencementDate?: string | null;
	expiryDate?: string | null;
	autoFinalizeAt?: string | null;
	fullName: string;
	email: string;
	phoneNumber: string;
	feeLineItems: FeeLine[];
	transaction?: { id: string; status: string; reference?: string | null; amount: unknown; createdAt: string; lastUpdated: string } | null;
	tenancyAgreementAsset?: { id: string; publicUrl: string } | null;
	guest: { id: string; user: { id: string } };
	hosting: { id: string; street?: string | null; landmarks?: string | null; city?: string | null; state?: string | null; propertyType?: string | null };
	userReview?: { id: string; description?: string | null; cleanliness?: number | null; accuracy?: number | null; communication?: number | null; location?: number | null; checkIn?: number | null; value?: number | null } | null;
};

export type Trip = {
	id: string;
	status: string;
	statusDetails?: string | null;
	fullName?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
	correspondenceAddress?: string | null;
	commencementDate?: string | null;
	intervalMultiplier?: number | null;
	createdAt: string;
	lastUpdated: string;
	guestFormData?: {
		employmentStatus: string;
		incomeRanges?: string | null;
		occupancyTypes?: string | null;
		guarantorRelationships?: string | null;
		guarantorName?: string | null;
		guarantorPhone?: string | null;
		guarantorAddress?: string | null;
	} | null;
	guest: { id: string; user: { id: string } };
	hosting: {
		id: string;
		title?: string | null;
		city?: string | null;
		state?: string | null;
		price?: unknown;
		paymentInterval?: string | null;
		propertyType?: string | null;
		host?: { id: string; user: { id: string; profile?: { fullName?: string | null } | null } } | null;
		coverImage?: { id: string; asset: { id: string; publicUrl: string } } | null;
	};
	booking?: TripBooking | null;
};

/** Land has no keys — the handover is taking possession. */
export const isLand = (propertyType?: string | null) => propertyType === PropertyType.LandPlots;

export function handoverWords(propertyType?: string | null) {
	return isLand(propertyType)
		? { thing: 'possession', confirm: 'I’ve taken possession', done: 'Possession confirmed', waypoint: 'Handover done' }
		: { thing: 'keys', confirm: 'I have my keys', done: 'Keys received', waypoint: 'Keys received' };
}

/** Itemised charges that add up to booking.amount (server-provided when present). */
export function feeLines(b: TripBooking): { label: string; amount: number; description?: string | null }[] {
	if (b.feeLineItems?.length) return b.feeLineItems.filter((l) => num(l.amount) > 0).map((l) => ({ label: l.label, amount: num(l.amount), description: l.description }));
	const rent = num(b.amount) - num(b.cautionFee) - num(b.serviceCharge) - num(b.legalFee) - num(b.stampDuty) - num(b.guestServiceCharge);
	return [
		{ label: 'Rent', amount: rent },
		{ label: 'Caution deposit (refundable)', amount: num(b.cautionFee) },
		{ label: 'Service charge', amount: num(b.serviceCharge) },
		{ label: 'Legal & agreement', amount: num(b.legalFee) },
		{ label: 'Stamp duty', amount: num(b.stampDuty) },
		{ label: 'Kushi platform fee', amount: num(b.guestServiceCharge) }
	].filter((l) => l.amount > 0);
}

/** What the guest gets back if they cancel now (mirrors the server's guest-fault refund). */
export function cancelRefund(b: TripBooking) {
	const amount = num(b.amount);
	const platform = num(b.guestServiceCharge);
	const caution = num(b.cautionFee);
	const custody = Math.min(num(b.cautionCustodyFee), caution);
	const service = num(b.serviceCharge);
	const legal = num(b.legalFee);
	const stamp = num(b.stampDuty);
	const rent = Math.max(0, amount - platform - caution - service - legal - stamp);
	const fee = rent * CANCEL_FEE_RATE;
	const charged = b.transaction?.amount != null ? num(b.transaction.amount) || amount : amount;
	const refund = Math.min(charged, rent - fee + service + legal + stamp + (caution - custody));
	return { refund: Math.round(refund), kept: { platform, fee: Math.round(fee), custody }, rent };
}

/** Paid, not finalised, not cancelled: the guest can confirm the handover or cancel. */
export const inGrace = (b?: TripBooking | null) => !!b && b.paymentStatus === 'PAID' && b.status !== 'COMPLETED' && b.status !== 'CANCELED';

/** Accepted but not paid yet (pending or a failed attempt). */
export const awaitingPayment = (b?: TripBooking | null) => !!b && b.status !== 'CANCELED' && b.status !== 'COMPLETED' && b.paymentStatus !== 'PAID';

/** Statuses the server lets the guest withdraw from. */
export const canWithdraw = (status?: string | null) => status === 'IN_PROGRESS' || status === 'SUBMITED' || status === 'SYSTEM_VERIFIED';

/** Hours (rounded) left in the grace period, or null when there's no deadline. */
export function graceLeft(autoFinalizeAt?: string | null): { days: number; hours: number } | null {
	if (!autoFinalizeAt) return null;
	const ms = new Date(autoFinalizeAt).getTime() - Date.now();
	if (Number.isNaN(ms)) return null;
	const left = Math.max(0, ms);
	return { days: Math.floor(left / 864e5), hours: Math.floor((left % 864e5) / 36e5) };
}

export function graceText(autoFinalizeAt?: string | null): string {
	const g = graceLeft(autoFinalizeAt);
	if (!g) return `Bookings complete automatically ${GRACE_DAYS} days after payment.`;
	if (g.days >= 1) return `${g.days} day${g.days === 1 ? '' : 's'} left`;
	if (g.hours >= 1) return `${g.hours} hour${g.hours === 1 ? '' : 's'} left`;
	return 'Completes within the hour';
}

export const EMPLOYMENT: Record<string, string> = { EMPLOYED: 'Employed', SELF_EMPLOYED: 'Self-employed', STUDENT: 'Student', CORP_MEMBER: 'Corps member', UNEMPLOYED: 'Between jobs' };
export const INCOME: Record<string, string> = { LOW: '₦100k – ₦200k a month', MID: '₦200k – ₦1m a month', HIGH: '₦1m – ₦5m a month', VIP: 'Above ₦5m a month' };
export const HOUSEHOLD: Record<string, string> = { SINGLE: 'Just me', COUPLE: 'A couple', SMALL_FAMILY: 'Small family (up to 4)', LARGE_FAMILY: 'Large family (5+)' };
export const RELATION: Record<string, string> = { PARENT: 'Parent', SIBLING: 'Sibling', SPOUSE: 'Spouse', EMPLOYER: 'Employer', CLERGY: 'Clergy', OTHER: 'Other' };

/** Employment statuses the server's risk check declines without a guarantor. */
export const NEEDS_GUARANTOR = ['STUDENT', 'CORP_MEMBER', 'UNEMPLOYED'];

export const clean = (m?: string | null) => (m ?? '').replace('[GraphQL] ', '').replace('[Network] ', '');
