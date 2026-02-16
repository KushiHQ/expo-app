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

export const BOOKING_QUERY = gql`
  query Booking($bookingId: String!) {
    booking(bookingId: $bookingId) {
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
        propertyType
        street
        landmarks
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
      fullName
      email
      paymentMethod
      tenancyAgreementAsset {
        id
        publicUrl
      }
      status
      userReview {
        averageRating
        description
        lastUpdated
        id
        user {
          id
          profile {
            fullName
            id
            gender
          }
        }
        checkIn
        accuracy
        cleanliness
        communication
        value
        location
      }
    }
  }
`;

export const GUEST_BOOKING_TENANCY_AGREEMENT_PREVIEW = gql`
  query GuestBookingTenancyAgreementPreview($bookingId: String!) {
    guestBookingTenancyAgreementPreview(bookingId: $bookingId)
  }
`;
