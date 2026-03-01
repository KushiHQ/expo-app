import { gql } from "urql";

export const INITIATE_PHONE_NUMBER_VERIFICATION = gql`
  mutation InitiatePhoneNumberVerification($phoneNumber: String!) {
    initiatePhoneNumberVerification(phoneNumber: $phoneNumber) {
      message
    }
  }
`;

export const COMPLETE_PHONE_NUMBER_VERIFICATION = gql`
  mutation CompletePhoneNumberVerification(
    $input: PhoneNumberVerificationInput!
  ) {
    completePhoneNumberVerification(input: $input) {
      message
    }
  }
`;
