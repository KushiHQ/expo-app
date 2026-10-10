/**
 * One guest-facing "where am I" model for an application and its booking.
 * Backend lifecycle: IN_PROGRESS → SUBMITED → SYSTEM_VERIFIED/ADMIN_VERIFIED/HOST_VERIFIED
 * → ACCEPTED (booking + payment created) → booking PAID → COMPLETED (keys confirmed,
 * or automatically 14 days after payment). REJECTED / CANCELLED / CANCELED end it.
 */
export type Stage =
	| 'draft'
	| 'review'
	| 'accepted' // pay now
	| 'paid' // awaiting keys
	| 'completed'
	| 'ended';

export type Tone = 'live' | 'info' | 'success' | 'danger' | 'neutral' | 'warn';

export type JourneyInput = {
	appStatus?: string | null;
	paymentStatus?: string | null;
	bookingStatus?: string | null;
};

export function stageOf(j: JourneyInput): Stage {
	const a = j.appStatus ?? '';
	if (a === 'REJECTED' || a === 'CANCELLED' || j.bookingStatus === 'CANCELED') return 'ended';
	if (j.bookingStatus === 'COMPLETED') return 'completed';
	if (j.paymentStatus === 'PAID' || j.bookingStatus === 'PAID') return 'paid';
	if (a === 'ACCEPTED') return 'accepted';
	if (a === 'IN_PROGRESS') return 'draft';
	return 'review';
}

export const STAGE: Record<Stage, { label: string; tone: Tone; next: string }> = {
	draft: { label: 'Not submitted', tone: 'neutral', next: 'Finish your application to send it to the host.' },
	review: { label: 'Under review', tone: 'info', next: 'Kushi and the host are reviewing your application.' },
	accepted: { label: 'Accepted — pay now', tone: 'live', next: 'The host said yes. Pay into escrow to secure the home.' },
	paid: { label: 'Paid · awaiting keys', tone: 'warn', next: 'Arrange the handover with your host, then confirm you have your keys.' },
	completed: { label: 'Moved in', tone: 'success', next: 'Your tenancy is active. Enjoy your new home.' },
	ended: { label: 'Closed', tone: 'neutral', next: 'This application is no longer active.' }
};

export const JOURNEY = [
	{ key: 'applied', label: 'Applied' },
	{ key: 'accepted', label: 'Host accepted' },
	{ key: 'paid', label: 'Paid into escrow' },
	{ key: 'keys', label: 'Keys received' }
] as const;

/** Index of the furthest completed waypoint (−1 = none). */
export function progress(stage: Stage): number {
	return { draft: -1, review: 0, accepted: 1, paid: 2, completed: 3, ended: -1 }[stage];
}

export function endedReason(appStatus?: string | null, bookingStatus?: string | null): string {
	if (bookingStatus === 'CANCELED') return 'This booking was cancelled.';
	if (appStatus === 'REJECTED') return 'The host chose another applicant this time.';
	if (appStatus === 'CANCELLED') return 'You withdrew this application.';
	return 'Closed.';
}
