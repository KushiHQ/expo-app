import { gql } from 'urql';

export const INITIATE_BOOKING_APPLICATION = gql`
  mutation InitiateBookingApplication($hostingId: String!) {
    initiateBookingApplication(hostingId: $hostingId) {
      message
      data {
        id
        fullName
        email
        phoneNumber
        commencementDate
        correspondenceAddress
        intervalMultiplier
        status
        statusDetails
        createdAt
        lastUpdated
        bookingAggrement {
          totalSections
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
        commencementDate
        correspondenceAddress
        intervalMultiplier
        status
        statusDetails
        createdAt
        lastUpdated
        bookingAggrement {
          totalSections
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

export const INITIATE_FINALIZE_BOOKING = gql`
  mutation InitiateFinalizeBooking($bookingId: String!) {
    initiateFinalizeBooking(bookingId: $bookingId) {
      message
    }
  }
`;

export const FINALIZE_BOOKING = gql`
  mutation FinalizeBooking($bookingId: String!, $otp: String!) {
    finalizeBooking(bookingId: $bookingId, otp: $otp) {
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
  mutation CompleteBookingApplicationSubmission($input: BookingApplicationSubmissionInput!) {
    completeBookingApplicationSubmission(input: $input) {
      message
    }
  }
`;

export const HOST_UPDATE_BOOKING_APPLICATION_STATUS = gql`
  mutation HostUpdateBookingApplicationStatus($input: BookingApplicationStatusUpdateInput!) {
    hostUpdateBookingApplicationStatus(input: $input) {
      message
    }
  }
`;

export const INITIATE_CANCEL_BOOKING = gql`
  mutation InitiateCancelBooking($bookingId: String!) {
    initiateCancelBooking(bookingId: $bookingId) {
      message
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: String!, $otp: String!) {
    cancelBooking(bookingId: $bookingId, otp: $otp) {
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

export const INITIATE_ACCEPT_BOOKING_APPLICATION = gql`
  mutation InitiateAcceptBookingApplication($applicationId: String!) {
    initiateAcceptBookingApplication(applicationId: $applicationId) {
      message
    }
  }
`;

export const ACCEPT_BOOKING_APPLICATION = gql`
  mutation AcceptBookingApplication($applicationId: String!, $otp: String!) {
    acceptBookingApplication(applicationId: $applicationId, otp: $otp) {
      message
      data {
        id
        status
        statusDetails
      }
    }
  }
`;

export const REQUEST_CAUTION_RELEASE = gql`
  mutation RequestCautionRelease($input: RequestCautionReleaseInput!) {
    requestCautionRelease(input: $input) {
      message
      data {
        id
        bookingId
        amountRequested
        status
        hostNotes
        disputeFeeApplied
        createdAt
        lastUpdated
      }
    }
  }
`;

export const RESPOND_TO_CAUTION_CLAIM = gql`
  mutation RespondToCautionClaim($input: RespondToCautionClaimInput!) {
    respondToCautionClaim(input: $input) {
      message
      data {
        id
        bookingId
        amountRequested
        status
        guestResponseNotes
        disputeFeeApplied
        createdAt
        lastUpdated
      }
    }
  }
`;

export const REQUEST_CAUTION_REFUND = gql`
  mutation RequestCautionRefund($input: RequestCautionRefundInput!) {
    requestCautionRefund(input: $input) {
      message
      data {
        id
        bookingId
        amount
        status
        accountNumber
        accountName
        bankName
        bankCode
        createdAt
        lastUpdated
      }
    }
  }
`;
