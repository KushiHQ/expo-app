import { gql } from "urql";

export const INITIATE_BOOKING = gql`
  mutation InitiateBooking($input: InitiateBookingInput!) {
    initiateBooking(input: $input) {
      data {
        id
        guestServiceCharge
        transaction {
          amount
          id
        }
      }
      message
    }
  }
`;

export const VERIFY_BOOKING_PAYMENT = gql`
  mutation VerifyBookingPayment($verifyBookingPaymentId: String!) {
    verifyBookingPayment(id: $verifyBookingPaymentId) {
      message
      data {
        id
        paymentStatus
      }
    }
  }
`;

export const FINALIZE_BOOKING = gql`
  mutation FinalizeBooking($bookingId: String!) {
    finalizeBooking(bookingId: $bookingId) {
      id
    }
  }
`;
