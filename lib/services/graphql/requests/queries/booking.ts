import { gql } from "urql";

export const BOOKING_APPLICATIONS_COUNT = gql`
  query BookingApplicationsCount($filter: BookingApplicationFilter) {
    bookingApplicationsCount(filter: $filter)
  }
`;

export const BOOKING_APPLICATIONS = gql`
  query BookingApplications(
    $filter: BookingApplicationFilter
    $pagination: PaginationInput
  ) {
    bookingApplications(filter: $filter, pagination: $pagination) {
      checkInDate
      fullName
      createdAt
      status
      id
      intervalMultiplier
    }
  }
`;

export const CALCULATE_HOSTING_FEE = gql`
  query CalculateHostingFees($hostingId: String!, $multiplier: Int!) {
    calculateHostingFees(hostingId: $hostingId, multiplier: $multiplier) {
      baseRent
      totalPayableAmount
      cautionFee
      serviceCharge
      legalFee
      guestServiceCharge
      hostServiceCharge
    }
  }
`;

export const BOOKING_APPLICATION = gql`
  query BookingApplication($bookingApplicationId: String!) {
    bookingApplication(bookingApplicationId: $bookingApplicationId) {
      id
      fullName
      email
      phoneNumber
      checkInDate
      correspondenceAddress
      intervalMultiplier
      status
      statusDetails
      createdAt
      lastUpdated
      guestFormData {
        employmentStatus
        incomeRanges
        occupancyTypes
        guarantorRelationships
      }
      bookingAggrement {
        sections {
          id
          title
          description
          priority
          preamble
          subClauses {
            id
            title
            description
            priority
            content
            isMandatory
            isActive
            isCustom
            requiredVariables {
              name
              type
            }
            providedValues {
              key
              value
            }
          }
        }
      }
    }
  }
`;

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
