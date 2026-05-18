import { BookingsQuery, PaymentStatus } from '../services/graphql/generated';

export function getBookingStatus(booking: BookingsQuery['bookings'][number]) {
  if (booking.paymentStatus === PaymentStatus.Pending) {
    return 'pending';
  } else if (booking.paymentStatus === PaymentStatus.Failed) {
    return 'failed';
  } else if (booking.paymentStatus === PaymentStatus.Paid) {
    if (new Date(booking.expiresAt ?? '') > new Date()) {
      return 'active';
    } else {
      return 'expired';
    }
  }
  return 'expired';
}
