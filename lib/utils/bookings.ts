import {
	BookingStatus,
	BookingsQuery,
	PaymentStatus,
} from "../services/graphql/generated";

export function getBookingStatus(booking: BookingsQuery["bookings"][number]) {
	if (booking.status === BookingStatus.Canceled) {
		return "cancelled";
	}
	if (booking.paymentStatus === PaymentStatus.Pending) {
		return "pending";
	} else if (booking.paymentStatus === PaymentStatus.Failed) {
		return "failed";
	} else if (booking.paymentStatus === PaymentStatus.Paid) {
		if (booking.status === BookingStatus.Paid) {
			return "paid";
		} else if (
			booking.status === BookingStatus.Completed &&
			new Date(booking.expiresAt ?? "") > new Date()
		) {
			return "active";
		} else {
			return "expired";
		}
	}
	return "expired";
}
