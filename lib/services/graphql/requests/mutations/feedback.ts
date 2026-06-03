import { gql } from 'urql';

export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input) {
      id
      type
      category
      rating
      title
      body
      contactConsent
      status
      createdAt
    }
  }
`;

export const SUBMIT_NPS_MUTATION = gql`
  mutation SubmitNPS($input: SubmitNPSInput!) {
    submitNps(input: $input) {
      id
      score
      reason
      context
      createdAt
    }
  }
`;

export const SUBMIT_SUPPORT_RATING_MUTATION = gql`
  mutation SubmitSupportRating($input: SubmitSupportRatingInput!) {
    submitSupportRating(input: $input) {
      id
      chatId
      rating
      comment
      createdAt
    }
  }
`;

export const ADD_SUPPORT_MESSAGE_ATTACHMENT_MUTATION = gql`
  mutation AddSupportMessageAttachment($messageId: String!, $file: Upload!) {
    addSupportMessageAttachment(messageId: $messageId, file: $file)
  }
`;
