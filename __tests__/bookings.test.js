import { BookingStatus, PaymentStatus } from '../lib/services/graphql/generated';
import { getBookingStatus } from '../lib/utils/bookings';

function createMockBooking(overrides) {
  return {
    id: 'test-booking-id',
    bookingReference: 'KUS-12345',
    expiresAt: overrides.expiresAt ?? null,
    paymentStatus: overrides.paymentStatus ?? PaymentStatus.Pending,
    status: overrides.status ?? null,
    createdAt: new Date().toISOString(),
    commencementDate: null,
    expiryDate: null,
    guestServiceCharge: 0,
    amount: 100000,
    phoneNumber: '+2348000000000',
    cautionFee: null,
    legalFee: null,
    stampDuty: null,
    serviceCharge: null,
    hosting: {
      id: 'hosting-id',
      title: 'Test Hosting',
      city: 'Abuja',
      country: 'Nigeria',
      state: 'FCT',
      price: 100000,
      paymentInterval: null,
      coverImage: null,
    },
    transaction: null,
    feeLineItems: [],
  };
}

describe('getBookingStatus', () => {
  it('returns "cancelled" when booking status is Canceled', () => {
    const booking = createMockBooking({
      status: BookingStatus.Canceled,
      paymentStatus: PaymentStatus.Paid,
    });
    expect(getBookingStatus(booking)).toBe('cancelled');
  });

  it('returns "active" when payment is paid and not expired', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const booking = createMockBooking({
      status: BookingStatus.Paid,
      paymentStatus: PaymentStatus.Paid,
      expiresAt: futureDate.toISOString(),
    });
    expect(getBookingStatus(booking)).toBe('active');
  });

  it('returns "pending" when payment status is Pending', () => {
    const booking = createMockBooking({
      status: null,
      paymentStatus: PaymentStatus.Pending,
    });
    expect(getBookingStatus(booking)).toBe('pending');
  });

  it('returns "failed" when payment status is Failed', () => {
    const booking = createMockBooking({
      status: null,
      paymentStatus: PaymentStatus.Failed,
    });
    expect(getBookingStatus(booking)).toBe('failed');
  });
});
