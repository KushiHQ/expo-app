import { gql } from "urql";

export const INITIATE_BOOKING_APPLICATION = gql`
  mutation InitiateBookingApplication($hostingId: String!) {
    initiateBookingApplication(hostingId: $hostingId) {
      message
      data {
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
        guestFormData {
          employmentStatus
          incomeRanges
          occupancyTypes
          guarantorRelationships
        }
      }
    }
  }
`;

export const UPDATE_BOOKING_APPLICATION = gql`
  mutation UpdateBookingApplication($input: BookingApplicationUpdateInput!) {
    updateBookingApplication(input: $input) {
      message
      data {
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
        guestFormData {
          employmentStatus
          incomeRanges
          occupancyTypes
          guarantorRelationships
        }
      }
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

export const INITIATE_BOOKING_APPLICATION_SUBMIT = gql`
  mutation InitiateBookingApplicationSubmission($applicationId: String!) {
    initiateBookingApplicationSubmission(applicationId: $applicationId) {
      message
    }
  }
`;

export const COMPLETE_BOOKING_APPLICATION_SUBMIT = gql`
  mutation CompleteBookingApplicationSubmission(
    $input: BookingApplicationSubmissionInput!
  ) {
    completeBookingApplicationSubmission(input: $input) {
      message
    }
  }
`;

export const HOST_UPDATE_BOOKING_APPLICATION_STATUS = gql`
  mutation HostUpdateBookingApplicationStatus(
    $input: BookingApplicationStatusUpdateInput!
  ) {
    hostUpdateBookingApplicationStatus(input: $input) {
      message
    }
  }
`;

export const CANCEL_BOOKING_APPLICATION = gql`
  mutation cancelBookingApplication($applicationId: String!) {
    cancelBookingApplication(applicationId: $applicationId) {
      message
    }
  }
`;
