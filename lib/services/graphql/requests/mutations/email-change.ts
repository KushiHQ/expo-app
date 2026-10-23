import { gql } from 'urql';

export const REQUEST_EMAIL_CHANGE = gql`
  mutation RequestEmailChange($newEmail: String!) {
    requestEmailChange(newEmail: $newEmail) {
      message
    }
  }
`;

export const CONFIRM_EMAIL_CHANGE = gql`
  mutation ConfirmEmailChange($newEmail: String!, $otp: String!) {
    confirmEmailChange(newEmail: $newEmail, otp: $otp) {
      id
      email
    }
  }
`;

export type ConfirmEmailChangeResult = { confirmEmailChange: { id: string; email: string } };
