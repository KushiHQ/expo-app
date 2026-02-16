import { gql } from "urql";

export const CREATE_UPDATE_HOST_PAYMENT_DETAILS = gql`
  mutation CreateUpdateHostPaymentDetails($input: HostAccountDetailsInput!) {
    createUpdateHostPaymentDetails(input: $input) {
      message
      data {
        id
        accountNumber
        bankCode
        createdAt
        lastUpdated
        bankDetails {
          name
          slug
          code
          active
          currency
          image
        }
        accountName
      }
    }
  }
`;

export const CREATE_FLUTTERWAVE_CARD_PAYMENTS = gql`
  mutation CreateFlutterwaveCardPaymentMethods($input: FlutterwaveCardInput!) {
    createFlutterwaveCardPaymentMethods(input: $input) {
      message
    }
  }
`;

export const AUTHORIZE_TRANSACTION_WITH_OTP = gql`
  mutation AuthorizeTransactionWithOtp($input: TransactionOtpAuthInput!) {
    authorizeTransactionWithOtp(input: $input) {
      message
    }
  }
`;

export const AUTHORIZE_TRANSACTION_WITH_PIN = gql`
  mutation AuthorizeTransactionWithPin($input: TransactionPinAuthInput!) {
    authorizeTransactionWithPin(input: $input) {
      message
    }
  }
`;
