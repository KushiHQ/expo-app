import { gql } from "urql";

export const BOOKINGS_QUERY = gql`
  query Bookings($filter: BookingFilterInput, $pagination: PaginationInput) {
    bookings(filter: $filter, pagination: $pagination) {
      id
      hosting {
        id
        coverImage {
          id
          asset {
            id
            publicUrl
          }
        }
        title
        city
        country
        state
        price
        paymentInterval
      }
      expiresAt
      paymentStatus
      transaction {
        id
      }
      createdAt
      checkInDate
      checkOutDate
      guestServiceCharge
      amount
      phoneNumber
    }
  }
`;
