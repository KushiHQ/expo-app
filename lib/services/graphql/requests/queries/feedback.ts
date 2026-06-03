import { gql } from 'urql';

export const CAN_LEAVE_BOOKING_FEEDBACK_QUERY = gql`
  query CanLeaveBookingFeedback($bookingId: String!) {
    canLeaveBookingFeedback(bookingId: $bookingId)
  }
`;

export const SHOULD_SHOW_NPS_SURVEY_QUERY = gql`
  query ShouldShowNPSSurvey {
    shouldShowNpsSurvey
  }
`;
